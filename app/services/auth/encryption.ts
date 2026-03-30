/**
 * Auth request encryption for the auth microservice.
 * Uses AES-256-CBC with PKCS7 padding; key and IV must match the backend.
 *
 * Env (must match backend when encryption.enabled is true):
 *   EXPO_PUBLIC_ENCRYPTION_KEY  Base64 256-bit AES key
 *   EXPO_PUBLIC_ENCRYPTION_IV   Base64 16-byte IV for CBC
 *
 */

import CryptoJS from 'crypto-js';

const ALGORITHM = 'AES-256-CBC';

function getEncryptionKey(): string {
  if (typeof process === 'undefined' || !process.env) return '';
  const env = process.env as Record<string, string | undefined>;
  return env.EXPO_PUBLIC_ENCRYPTION_KEY ?? '';
}

function getEncryptionIV(): string {
  if (typeof process === 'undefined' || !process.env) return '';
  const env = process.env as Record<string, string | undefined>;
  return env.EXPO_PUBLIC_ENCRYPTION_IV ?? '';
}

/**
 * Encrypt a plain object to Base64 ciphertext using AES-256-CBC.
 * Uses EXPO_PUBLIC_ENCRYPTION_KEY and EXPO_PUBLIC_ENCRYPTION_IV.
 */
export async function encryptPayload(
  plainObject: object,
  keyBase64?: string,
  ivBase64?: string
): Promise<string> {
  const key = keyBase64 ?? getEncryptionKey();
  const iv = ivBase64 ?? getEncryptionIV();

  if (!key || !iv) {
    throw new Error(
      'Encryption keys missing. Set EXPO_PUBLIC_ENCRYPTION_KEY and EXPO_PUBLIC_ENCRYPTION_IV.'
    );
  }

  const keyWords = CryptoJS.enc.Base64.parse(key);
  const ivWords = CryptoJS.enc.Base64.parse(iv);
  const plainText = JSON.stringify(plainObject);

  const encrypted = CryptoJS.AES.encrypt(plainText, keyWords, {
    iv: ivWords,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

/** Whether encryption env vars are set (encryption enabled). */
export function isEncryptionEnabled(): boolean {
  const key = getEncryptionKey();
  const iv = getEncryptionIV();
  return Boolean(key && iv);
}
