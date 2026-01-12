CREATE TABLE patient_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_sub TEXT NOT NULL,              -- Cognito user ID (not encrypted but still sensitive)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Encrypted identifiers
  name_iv TEXT NOT NULL,
  name_value TEXT NOT NULL,
  name_tag TEXT NOT NULL,

  email_iv TEXT NOT NULL,
  email_value TEXT NOT NULL,
  email_tag TEXT NOT NULL,

  dob_iv TEXT NOT NULL,
  dob_value TEXT NOT NULL,
  dob_tag TEXT NOT NULL,

  address_iv TEXT NOT NULL,
  address_value TEXT NOT NULL,
  address_tag TEXT NOT NULL,

  insurance_iv TEXT NOT NULL,
  insurance_value TEXT NOT NULL,
  insurance_tag TEXT NOT NULL,

  -- Clinical data (JSON-encrypted blobs)
  diagnoses_iv TEXT NOT NULL,
  diagnoses_value TEXT NOT NULL,
  diagnoses_tag TEXT NOT NULL,

  meds_iv TEXT NOT NULL,
  meds_value TEXT NOT NULL,
  meds_tag TEXT NOT NULL,

  labs_iv TEXT NOT NULL,
  labs_value TEXT NOT NULL,
  labs_tag TEXT NOT NULL,

  symptoms_iv TEXT NOT NULL,
  symptoms_value TEXT NOT NULL,
  symptoms_tag TEXT NOT NULL,

  goals_iv TEXT NOT NULL,
  goals_value TEXT NOT NULL,
  goals_tag TEXT NOT NULL
);

CREATE INDEX idx_patient_intakes_user_sub ON patient_intakes (user_sub);
