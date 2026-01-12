import { encryptField, decryptField, isEncryptionEnabled, EncryptedField } from './phiEncryption';

export interface PatientIntakeData {
  name: string;
  email: string;
  dob: string;
  address?: string;
  insuranceId?: string;
  diagnoses?: string[];
  meds?: string[];
  labs?: string[];
  symptoms?: string[];
  goals?: string[];
}

export interface EncryptedPatientRecord {
  userSub: string;
  createdAt: string;
  name: EncryptedField | null;
  email: EncryptedField | null;
  dob: EncryptedField | null;
  address: EncryptedField | null;
  insuranceId: EncryptedField | null;
  diagnoses: EncryptedField | null;
  meds: EncryptedField | null;
  labs: EncryptedField | null;
  symptoms: EncryptedField | null;
  goals: EncryptedField | null;
}

export function encryptPatientIntake(userSub: string, intakeData: PatientIntakeData): EncryptedPatientRecord {
  return {
    userSub,
    createdAt: new Date().toISOString(),
    name: encryptField(intakeData.name),
    email: encryptField(intakeData.email),
    dob: encryptField(intakeData.dob),
    address: intakeData.address ? encryptField(intakeData.address) : null,
    insuranceId: intakeData.insuranceId ? encryptField(intakeData.insuranceId) : null,
    diagnoses: encryptField(JSON.stringify(intakeData.diagnoses || [])),
    meds: encryptField(JSON.stringify(intakeData.meds || [])),
    labs: encryptField(JSON.stringify(intakeData.labs || [])),
    symptoms: encryptField(JSON.stringify(intakeData.symptoms || [])),
    goals: encryptField(JSON.stringify(intakeData.goals || []))
  };
}

export function decryptPatientRecord(record: EncryptedPatientRecord): PatientIntakeData | null {
  if (!isEncryptionEnabled()) {
    return null;
  }

  try {
    const name = record.name ? decryptField(record.name) : null;
    const email = record.email ? decryptField(record.email) : null;
    const dob = record.dob ? decryptField(record.dob) : null;

    if (!name || !email || !dob) {
      return null;
    }

    return {
      name,
      email,
      dob,
      address: record.address ? decryptField(record.address) || undefined : undefined,
      insuranceId: record.insuranceId ? decryptField(record.insuranceId) || undefined : undefined,
      diagnoses: record.diagnoses ? JSON.parse(decryptField(record.diagnoses) || '[]') : [],
      meds: record.meds ? JSON.parse(decryptField(record.meds) || '[]') : [],
      labs: record.labs ? JSON.parse(decryptField(record.labs) || '[]') : [],
      symptoms: record.symptoms ? JSON.parse(decryptField(record.symptoms) || '[]') : [],
      goals: record.goals ? JSON.parse(decryptField(record.goals) || '[]') : []
    };
  } catch (err) {
    console.error('[PHI_STORAGE] Failed to decrypt patient record');
    return null;
  }
}

export const PHI_FIELDS = [
  'name',
  'email', 
  'dob',
  'address',
  'insuranceId',
  'diagnoses',
  'meds',
  'labs',
  'symptoms',
  'goals'
] as const;

export type PhiFieldName = typeof PHI_FIELDS[number];
