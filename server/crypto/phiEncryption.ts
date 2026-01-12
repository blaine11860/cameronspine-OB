import crypto from 'crypto';

const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const ALGORITHM = 'aes-256-gcm';

export interface EncryptedField {
  iv: string;
  value: string;
  tag: string;
  v: number;
}

let encryptionKey: Buffer | null = null;

export function initializeEncryption(): boolean {
  const keyBase64 = process.env.FIELD_ENCRYPTION_KEY;
  
  if (!keyBase64) {
    console.warn('[PHI_ENCRYPTION] FIELD_ENCRYPTION_KEY not configured - encryption disabled');
    return false;
  }

  try {
    const keyBuffer = Buffer.from(keyBase64, 'base64');
    
    if (keyBuffer.length !== KEY_LENGTH) {
      console.error(`[PHI_ENCRYPTION] Invalid key length: expected ${KEY_LENGTH} bytes, got ${keyBuffer.length}`);
      return false;
    }
    
    encryptionKey = keyBuffer;
    console.log('[PHI_ENCRYPTION] Field encryption initialized successfully');
    return true;
  } catch (err) {
    console.error('[PHI_ENCRYPTION] Failed to initialize encryption key:', err);
    return false;
  }
}

export function isEncryptionEnabled(): boolean {
  return encryptionKey !== null;
}

export function encryptField(plaintext: string): EncryptedField | null {
  if (!encryptionKey) {
    return null;
  }

  if (plaintext === null || plaintext === undefined) {
    return null;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    let encrypted = cipher.update(String(plaintext), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('base64'),
      value: encrypted,
      tag: authTag.toString('base64'),
      v: 1
    };
  } catch (err) {
    console.error('[PHI_ENCRYPTION] Encryption failed');
    return null;
  }
}

export function decryptField(encObj: EncryptedField): string | null {
  if (!encryptionKey) {
    return null;
  }

  if (!encObj || !encObj.iv || !encObj.value || !encObj.tag) {
    return null;
  }

  try {
    const iv = Buffer.from(encObj.iv, 'base64');
    const authTag = Buffer.from(encObj.tag, 'base64');

    if (iv.length !== IV_LENGTH) {
      console.error('[PHI_ENCRYPTION] Invalid IV length');
      return null;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encObj.value, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[PHI_ENCRYPTION] Decryption failed - possible tampering or wrong key');
    return null;
  }
}

export function encryptPhiFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: string[]
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const result = { ...data };

  for (const field of fieldsToEncrypt) {
    if (result[field] !== undefined && result[field] !== null) {
      const encrypted = encryptField(String(result[field]));
      if (encrypted) {
        (result as any)[field] = encrypted;
      }
    }
  }

  return result;
}

export function decryptPhiFields<T extends Record<string, any>>(
  data: T,
  fieldsToDecrypt: string[]
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const result = { ...data };

  for (const field of fieldsToDecrypt) {
    const fieldValue = result[field];
    if (fieldValue && typeof fieldValue === 'object' && 'iv' in fieldValue && 'value' in fieldValue && 'tag' in fieldValue) {
      const decrypted = decryptField(fieldValue as EncryptedField);
      if (decrypted !== null) {
        (result as any)[field] = decrypted;
      }
    }
  }

  return result;
}

export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  return key.toString('base64');
}
