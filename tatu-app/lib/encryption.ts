import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
// Use dummy key during build time, will check at runtime
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0'.repeat(64); // 32 bytes = 64 hex chars

// Assert that ENCRYPTION_KEY is a string after the check
const ENCRYPTION_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY as string, 'hex');

export function encrypt(text: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Combine IV, salt, tag, and encrypted data
  return Buffer.concat([iv, salt, tag, Buffer.from(encrypted, 'hex')])
    .toString('base64');
}

export function decrypt(encryptedData: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  const buffer = Buffer.from(encryptedData, 'base64');
  
  const iv = buffer.subarray(0, IV_LENGTH);
  const salt = buffer.subarray(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
  const tag = buffer.subarray(IV_LENGTH + SALT_LENGTH, IV_LENGTH + SALT_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + SALT_LENGTH + TAG_LENGTH);
  
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
} 