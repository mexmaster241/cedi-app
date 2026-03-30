/**
 * Gateway encryption – AES-256-GCM.
 * Matches backend GATEWAY_ENCRYPTION_KEY. Used for request/response body encryption.
 *
 * Env: EXPO_PUBLIC_GATEWAY_ENCRYPTION_KEY – Base64 256-bit (32 bytes) AES key
 */

import { gcm } from '@noble/ciphers/aes';
import { randomBytes, utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils';

const GCM_NONCE_LENGTH = 12;
const KEY_LENGTH = 32;

function getGatewayKey(): Uint8Array {
  const env = typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {};
  const keyBase64 = env.EXPO_PUBLIC_GATEWAY_ENCRYPTION_KEY ?? '';
  if (!keyBase64) {
    throw new Error(
      'Gateway encryption key missing. Set EXPO_PUBLIC_GATEWAY_ENCRYPTION_KEY (Base64 32-byte key).'
    );
  }
  const key = base64Decode(keyBase64);
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `Gateway key must be 32 bytes (256-bit), got ${key.length}. Ensure EXPO_PUBLIC_GATEWAY_ENCRYPTION_KEY is Base64-encoded.`
    );
  }
  return key;
}

function base64Encode(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  return typeof btoa !== 'undefined' ? btoa(binary) : fallbackBase64Encode(bytes);
}

function base64Decode(str: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(str, 'base64'));
  }
  const binary = typeof atob !== 'undefined' ? atob(str) : fallbackBase64Decode(str);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** Fallback for environments without Buffer/btoa/atob */
function fallbackBase64Encode(bytes: Uint8Array): string {
  const B64 =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += B64[a >> 2];
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b !== undefined ? B64[((b & 15) << 2) | ((c ?? 0) >> 6)] : '=';
    out += c !== undefined ? B64[c & 63] : '=';
  }
  return out;
}

function fallbackBase64Decode(str: string): string {
  const B64 =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(123);
  for (let i = 0; i < B64.length; i++) lookup[B64.charCodeAt(i)] = i;
  let len = str.length;
  if (str.endsWith('==')) len -= 2;
  else if (str.endsWith('=')) len -= 1;
  const out: number[] = [];
  for (let i = 0; i < len; i += 4) {
    const n =
      (lookup[str.charCodeAt(i)] << 18) |
      (lookup[str.charCodeAt(i + 1)] << 12) |
      (lookup[str.charCodeAt(i + 2)] << 6) |
      lookup[str.charCodeAt(i + 3)];
    out.push((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }
  return String.fromCharCode(...out.slice(0, (len * 3) >> 2));
}

export interface EncryptedPayload {
  payload: string;
  iv: string;
}

/**
 * Encrypt inner JSON with AES-256-GCM. Returns Base64 payload and IV.
 */
export function encryptForGateway(inner: object): EncryptedPayload {
  const key = getGatewayKey();
  const nonce = randomBytes(GCM_NONCE_LENGTH);
  const cipher = gcm(key, nonce);
  const plaintext = utf8ToBytes(JSON.stringify(inner));
  const ciphertext = cipher.encrypt(plaintext);
  return {
    payload: base64Encode(ciphertext),
    iv: base64Encode(nonce),
  };
}

/**
 * Decrypt response payload. Expects Base64 payload and IV.
 */
export function decryptFromGateway(payloadBase64: string, ivBase64: string): unknown {
  const key = getGatewayKey();
  const nonce = base64Decode(ivBase64);
  const ciphertext = base64Decode(payloadBase64);
  const cipher = gcm(key, nonce);
  const plaintext = cipher.decrypt(ciphertext);
  const json = bytesToUtf8(plaintext);
  return JSON.parse(json);
}

export function isGatewayEncryptionEnabled(): boolean {
  try {
    const env = typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : {};
    return Boolean(env.EXPO_PUBLIC_GATEWAY_ENCRYPTION_KEY);
  } catch {
    return false;
  }
}
