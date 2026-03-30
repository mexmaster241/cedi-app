/**
 * Auth API Service - HTTP calls to the Auth microservice.
 * Replaces supabase.auth with microservice logic.
 * Based on cediOs auth.api.ts structure.
 *
 * Base URL: EXPO_PUBLIC_API_URL (e.g. https://api.example.com/auth/v1)
 * Fallback: EXPO_PUBLIC_SUPABASE_URL/auth/v1 (Supabase REST API)
 */

import axios from 'axios';
import { getAuthClient, getAuthErrorMessage, isAuthError } from './client';
import * as authStorage from './auth.storage';
import { encryptPayload, isEncryptionEnabled } from './encryption';
import type { AuthSession, AuthUser, AuthResponse, MfaFactor } from './auth.types';

/** Payload key expected by auth microservice for encrypted requests */
const ENCRYPTED_PAYLOAD_KEY = 'encryptedData';

async function buildEncryptedBody(payload: object): Promise<Record<string, string>> {
  if (!isEncryptionEnabled()) {
    throw new Error(
      'Auth API requires encryption. Set EXPO_PUBLIC_ENCRYPTION_KEY and EXPO_PUBLIC_ENCRYPTION_IV in .env'
    );
  }
  const data = await encryptPayload(payload);
  return { [ENCRYPTED_PAYLOAD_KEY]: data };
}

const AUTH_BASE_URL =`${process.env.EXPO_PUBLIC_API_URL}/auth/v1`;

function toAuthUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: (raw.id as string) || '',
    email: raw.email as string | undefined,
    phone: raw.phone as string | undefined,
    user_metadata: (raw.user_metadata || raw.userMetadata) as Record<string, unknown> | undefined,
    app_metadata: (raw.app_metadata || raw.appMetadata) as Record<string, unknown> | undefined,
    email_confirmed_at: (raw.email_confirmed_at ?? raw.emailConfirmedAt) as string | null | undefined,
    created_at: (raw.created_at || raw.createdAt) as string | undefined,
    updated_at: (raw.updated_at || raw.updatedAt) as string | undefined,
  };
}

function toAuthSession(raw: Record<string, unknown>): AuthSession {
  const user = raw.user
    ? toAuthUser(raw.user as Record<string, unknown>)
    : { id: '', email: '', user_metadata: {}, app_metadata: {} };
  return {
    access_token: (raw.access_token || raw.accessToken) as string,
    refresh_token: (raw.refresh_token ?? raw.refreshToken) as string | undefined,
    expires_in: (raw.expires_in ?? raw.expiresIn) as number | undefined,
    expires_at: (raw.expires_at ?? raw.expiresAt) as number | undefined,
    token_type: (raw.token_type || raw.tokenType || 'bearer') as string,
    user,
  };
}

/** Microservice session response (cediOs format) */
interface MicroserviceSession {
  accessToken?: string;
  refreshToken?: string | null;
  user?: { id?: string; email?: string; [k: string]: unknown };
}


/** Sign in - microservice /signin */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const body = await buildEncryptedBody({ email, password });
    const { data } = await axios.post<{ session: MicroserviceSession }>(
      `${AUTH_BASE_URL}/signin`,
      body,
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );
    const s = data?.session;
    if (!s?.accessToken) throw new Error('Invalid signin response');
    const session = toAuthSession({
      access_token: s.accessToken,
      refresh_token: s.refreshToken,
      user: s.user || { id: '', email },
    });

    await authStorage.setAuthTokens(session.access_token, session.refresh_token);
    await authStorage.setAuthUser(session.user);

    return { data: { session, user: session.user } };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const res = error.response?.data as Record<string, unknown>;
      const msg =
        (res?.error_description as string) ||
        (res?.message as string) ||
        (res?.msg as string) ||
        error.message;
      return { error: { message: msg, code: String(error.response?.status) } };
    }
    return { error: { message: String(error) } };
  }
}

/** Sign out - call backend /signout (microservice) or just clear storage (Supabase) */
export async function signOut(): Promise<void> {
  try {
      const token = await authStorage.getAccessToken();
      if (token && AUTH_BASE_URL) {
        await axios.post(
          `${AUTH_BASE_URL}/signout`,
          {},
          { headers: { Authorization: `Bearer ${token}`, 'X-User-Token': `Bearer ${token}` }, timeout: 5000 }
        );
      }
  } catch {
    // Ignore logout API errors
  } finally {
    await authStorage.clearAuthStorage();
  }
}

/** Get current session from storage (and optionally validate with API) */
export async function getSession(): Promise<{ session: AuthSession; user: AuthUser } | null> {
  const accessToken = await authStorage.getAccessToken();
  const refreshToken = await authStorage.getRefreshToken();
  const storedUser = await authStorage.getAuthUser();

  if (!accessToken) return null;

  const user = storedUser ? toAuthUser(storedUser) : { id: '', email: '', user_metadata: {}, app_metadata: {} };
  const session: AuthSession = {
    access_token: accessToken,
    refresh_token: refreshToken ?? undefined,
    token_type: 'bearer',
    user,
  };

  return { session, user };
}

/** Refresh session - Supabase /token?grant_type=refresh_token */
export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  try {
    const url = `${AUTH_BASE_URL}/token?grant_type=refresh_token`;
    const { data } = await axios.post(
      url,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const session = toAuthSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      expires_at: data.expires_at,
      token_type: data.token_type,
      user: data.user || { id: data.user_id || '', email: data.email },
    });

    await authStorage.setAuthTokens(session.access_token, session.refresh_token);
    await authStorage.setAuthUser(session.user);

    return { data: { session, user: session.user } };
  } catch (error) {
    await authStorage.clearAuthStorage();
    const msg = isAuthError(error) ? getAuthErrorMessage(error) : String(error);
    return { error: { message: msg } };
  }
}

/** Get current user (from storage or API) */
export async function getUser(): Promise<AuthUser | null> {
  const { user } = (await getSession()) || {};
  return user || null;
}

/** List MFA factors */
export async function listMfaFactors(): Promise<MfaFactor[]> {
  const client = getAuthClient();
  const { data } = await client.get<{ factors?: MfaFactor[] }>('/mfa/factors');
  return data?.factors ?? [];
}

/** Challenge MFA factor */
export async function challengeMfaFactor(factorId: string): Promise<{ id: string }> {
  const client = getAuthClient();
  const body = await buildEncryptedBody({ factorId });
  const { data } = await client.post<{ challengeId?: string }>('/mfa/challenge', body);
  return { id: data?.challengeId ?? '' };
}

/** Verify MFA code */
export async function verifyMfaFactor(
  factorId: string,
  challengeId: string,
  code: string
): Promise<void> {
  const client = getAuthClient();
  const body = await buildEncryptedBody({ factorId, challengeId, code });
  await client.post('/mfa/verify', body);
}

/** Unenroll MFA factor */
export async function unenrollMfaFactor(factorId: string): Promise<void> {
  const client = getAuthClient();
  await client.delete(`/mfa/factors/${encodeURIComponent(factorId)}`);
}

/** Enroll MFA factor */
export async function enrollMfaFactor(
  factorType: 'totp',
  issuer: string,
  friendlyName: string
): Promise<{ id: string; factor?: { totp?: { secret?: string; uri?: string } } }> {
  const client = getAuthClient();
  const body = await buildEncryptedBody({ factorType, issuer, friendlyName });
  const { data } = await client.post('/mfa/enroll', body);
  return data ?? { id: '' };
}
