// lambda/index.js

const crypto = require('crypto');
const db = require('./db');

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

function decryptField(encObj) {
  const iv = Buffer.from(encObj.iv, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, iv);

  const authTag = Buffer.from(encObj.tag, 'base64');
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encObj.value, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// --- RBAC helper ---
function requireRole(event, allowedRoles) {
  const claims = event.requestContext.authorizer.claims || {};
  const groups = claims["cognito:groups"] || "";
  const userRoles = groups ? groups.split(",") : [];
  return allowedRoles.some(r => userRoles.includes(r));
}

// --- Audit log helper ---
function audit(eventType, event, extra = {}) {
  const claims = event.requestContext.authorizer.claims || {};
  console.log(JSON.stringify({
    eventType,
    userSub: claims.sub,
    path: event.rawPath,
    method: event.requestContext.http.method,
    timestamp: new Date().toISOString(),
    ...extra
  }));
}

// --- DB operations ---
async function savePatientIntake(userSub, intakeData) {
  const rec = {
    user_sub: userSub,
    name: encryptField(intakeData.name),
    email: encryptField(intakeData.email),
    dob: encryptField(intakeData.dob),
    address: encryptField(intakeData.address),
    insurance: encryptField(intakeData.insuranceId),
    diagnoses: encryptField(JSON.stringify(intakeData.diagnoses || [])),
    meds: encryptField(JSON.stringify(intakeData.meds || [])),
    labs: encryptField(JSON.stringify(intakeData.labs || [])),
    symptoms: encryptField(JSON.stringify(intakeData.symptoms || [])),
    goals: encryptField(JSON.stringify(intakeData.goals || []))
  };

  const query = `
    INSERT INTO patient_intakes (
      user_sub,
      name_iv, name_value, name_tag,
      email_iv, email_value, email_tag,
      dob_iv, dob_value, dob_tag,
      address_iv, address_value, address_tag,
      insurance_iv, insurance_value, insurance_tag,
      diagnoses_iv, diagnoses_value, diagnoses_tag,
      meds_iv, meds_value, meds_tag,
      labs_iv, labs_value, labs_tag,
      symptoms_iv, symptoms_value, symptoms_tag,
      goals_iv, goals_value, goals_tag
    ) VALUES (
      $1,
      $2, $3, $4,
      $5, $6, $7,
      $8, $9, $10,
      $11, $12, $13,
      $14, $15, $16,
      $17, $18, $19,
      $20, $21, $22,
      $23, $24, $25,
      $26, $27, $28,
      $29, $30, $31
    )
    RETURNING id, created_at;
  `;

  const params = [
    rec.user_sub,
    rec.name.iv, rec.name.value, rec.name.tag,
    rec.email.iv, rec.email.value, rec.email.tag,
    rec.dob.iv, rec.dob.value, rec.dob.tag,
    rec.address.iv, rec.address.value, rec.address.tag,
    rec.insurance.iv, rec.insurance.value, rec.insurance.tag,
    rec.diagnoses.iv, rec.diagnoses.value, rec.diagnoses.tag,
    rec.meds.iv, rec.meds.value, rec.meds.tag,
    rec.labs.iv, rec.labs.value, rec.labs.tag,
    rec.symptoms.iv, rec.symptoms.value, rec.symptoms.tag,
    rec.goals.iv, rec.goals.value, rec.goals.tag
  ];

  const result = await db.query(query, params);
  return result.rows[0];
}

async function getLatestPatientIntake(userSub) {
  const query = `
    SELECT *
    FROM patient_intakes
    WHERE user_sub = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await db.query(query, [userSub]);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  // Decrypt only what you need to show
  const name = decryptField({
    iv: row.name_iv,
    value: row.name_value,
    tag: row.name_tag
  });

  const diagnoses = JSON.parse(decryptField({
    iv: row.diagnoses_iv,
    value: row.diagnoses_value,
    tag: row.diagnoses_tag
  }));

  const meds = JSON.parse(decryptField({
    iv: row.meds_iv,
    value: row.meds_value,
    tag: row.meds_tag
  }));

  return {
    name,
    diagnoses,
    meds
    // add more as needed
  };
}

// --- Lambda handler ---
exports.handler = async (event) => {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // Parse JSON body
  let body = {};
  try {
    if (event.body) body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // PHI intake
  if (path === "/phi/intake" && method === "POST") {
    if (!requireRole(event, ["clinician"])) {
      audit("access_denied", event);
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
    }

    if (!body.name || !body.dob) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    try {
      const claims = event.requestContext.authorizer.claims || {};
      const userSub = claims.sub;

      const saved = await savePatientIntake(userSub, body);
      audit("phi_intake_saved", event, { recordId: saved.id });
      return { statusCode: 200, body: JSON.stringify({ success: true, id: saved.id }) };
    } catch (err) {
      audit("phi_intake_error", event, { error: err.message });
      return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
    }
  }

  // Zero-retention compute endpoint
  if (path === "/phi/compute-risk" && method === "POST") {
    // Do not store to DB
    const score = Math.random() * 10; // placeholder logic
    audit("risk_score_computed", event, { stored: false });
    return { statusCode: 200, body: JSON.stringify({ score }) };
  }

  // PHI summary
  if (path === "/phi/summary" && method === "GET") {
    if (!requireRole(event, ["patient", "clinician"])) {
      audit("access_denied", event);
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
    }

    try {
      const claims = event.requestContext.authorizer.claims || {};
      const userSub = claims.sub;

      const summary = await getLatestPatientIntake(userSub);
      if (!summary) {
        return { statusCode: 404, body: JSON.stringify({ error: "No records" }) };
      }

      audit("phi_summary_viewed", event);
      return { statusCode: 200, body: JSON.stringify(summary) };
    } catch (err) {
      audit("phi_summary_error", event, { error: err.message });
      return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
    }
  }

  return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
};
