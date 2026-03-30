/**
 * Auth token storage.
 * Uses SecureStore on iOS/Android and AsyncStorage on web.
 */

import * as safeStorage from './safe-storage';

const KEYS = {
  ACCESS_TOKEN: 'authAccessToken',
  REFRESH_TOKEN: 'authRefreshToken',
  USER: 'authUser',
} as const;

export async function setAuthTokens(accessToken: string, refreshToken?: string | null): Promise<void> {
  await safeStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    await safeStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  } else {
    await safeStorage.deleteItem(KEYS.REFRESH_TOKEN);
  }
}

export async function getAccessToken(): Promise<string | null> {
  return safeStorage.getItem(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return safeStorage.getItem(KEYS.REFRESH_TOKEN);
}

export async function setAuthUser(user: object): Promise<void> {
  await safeStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function getAuthUser(): Promise<Record<string, unknown> | null> {
  const raw = await safeStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuthStorage(): Promise<void> {
  const keys = [
    KEYS.ACCESS_TOKEN,
    KEYS.REFRESH_TOKEN,
    KEYS.USER,
    'supabaseRefreshToken',
    'biometricEnabled',
    'supabaseAccessToken',
    // Legacy keycloak token keys
    'keycloak_token_core',
    'keycloak_token_onboarding',
    'keycloak_token_teams',
    'keycloak_token_invoice',
  ];
  await Promise.all(keys.map((k) => safeStorage.deleteItem(k)));
}
