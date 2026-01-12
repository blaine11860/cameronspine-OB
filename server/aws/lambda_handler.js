// lambda/index.js

const crypto = require('crypto');

// Field-level encryption key (store in AWS Secrets Manager)
const ENC_KEY = Buffer.from(process.env.FIELD_ENCRYPTION_KEY, 'base64');
const IV_LENGTH = 12;

// --- Encryption helpers ---
function encryptField(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv);

  let encrypted = cipher.update(String(plaintext), 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const tag = cipher.getAuthTag().toString('base64');

  return { iv: iv.toString('base64'), value: encrypted, tag };
}

// --- RBAC helper ---
function requireRole(event, allowedRoles) {
  const groups = event.requestContext.authorizer.claims["cognito:groups"] || "";
  const userRoles = groups.split(",");

  return allowedRoles.some(r => userRoles.includes(r));
}

// --- Audit log helper ---
function audit(eventType, event, extra = {}) {
  console.log(JSON.stringify({
    eventType,
    userSub: event.requestContext.authorizer.claims.sub,
    path: event.rawPath,
    method: event.requestContext.http.method,
    timestamp: new Date().toISOString(),
    ...extra
  }));
}

// --- Main Lambda handler ---
exports.handler = async (event) => {
  const userSub = event.requestContext.authorizer.claims.sub;
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // Parse body safely
  let body = {};
  try {
    if (event.body) body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // --- PHI Intake (Clinician only) ---
  if (path === "/phi/intake" && method === "POST") {
    if (!requireRole(event, ["clinician"])) {
      audit("access_denied", event);
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
    }

    // Validate required fields
    if (!body.name || !body.dob) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
    }

    // Encrypt PHI fields
    const record = {
      user_sub: userSub,
      name: encryptField(body.name),
      email: encryptField(body.email || ''),
      dob: encryptField(body.dob),
      address: encryptField(body.address || ''),
      insurance: encryptField(body.insuranceId || ''),
      diagnoses: encryptField(JSON.stringify(body.diagnoses || [])),
      meds: encryptField(JSON.stringify(body.meds || [])),
      labs: encryptField(JSON.stringify(body.labs || [])),
      symptoms: encryptField(JSON.stringify(body.symptoms || [])),
      goals: encryptField(JSON.stringify(body.goals || []))
    };

    // TODO: Save to DynamoDB or RDS
    // await saveToDatabase(record);

    audit("phi_intake_saved", event, { stored: true });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Intake saved" })
    };
  }

  // --- PHI Summary (Patient or Clinician) ---
  if (path === "/phi/summary" && method === "GET") {
    if (!requireRole(event, ["patient", "clinician"])) {
      audit("access_denied", event);
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
    }

    // TODO: Fetch and decrypt from database
    audit("phi_summary_viewed", event);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Summary endpoint" })
    };
  }

  // --- Compute Risk Score (No storage) ---
  if (path === "/phi/compute-risk-score" && method === "POST") {
    if (!requireRole(event, ["patient", "clinician"])) {
      audit("access_denied", event);
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
    }

    const { symptoms, age, sex } = body;
    if (!symptoms) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing symptoms" }) };
    }

    // Compute in memory only
    const score = computeRiskScore({ symptoms, age, sex });

    audit("risk_score_computed", event, { stored: false });

    return {
      statusCode: 200,
      body: JSON.stringify({ score })
    };
  }

  return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
};

function computeRiskScore({ symptoms, age, sex }) {
  let score = 0;
  const highRisk = ['severe_headache', 'blurred_vision', 'chest_pain', 
    'vaginal_bleeding', 'decreased_fetal_movement', 'severe_abdominal_pain',
    'high_blood_pressure', 'swelling', 'preterm_contractions'];
  const moderate = ['nausea', 'fatigue', 'back_pain', 'headache', 
    'anxiety', 'insomnia', 'heartburn'];

  for (const s of symptoms || []) {
    if (highRisk.includes(s.toLowerCase())) score += 15;
    else if (moderate.includes(s.toLowerCase())) score += 3;
    else score += 1;
  }

  if (age >= 35) score += 10;
  if (age >= 40) score += 10;

  return Math.min(score, 100);
}
