/**
 * Transaction Orchestrator HTTP client.
 * Base URL: EXPO_PUBLIC_API_URL/transaction-orchestrator/v1/transaction
 */

import * as authStorage from '../auth/auth.storage';

const BASE_PATH = '/transaction-orchestrator/v1/transaction';

function getBaseUrl(): string {
  const api = process.env.EXPO_PUBLIC_API_URL ?? '';
  return `${api.replace(/\/+$/, '')}${BASE_PATH}`;
}

export async function getTransactionOrchestratorClient(): Promise<{
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, data: unknown) => Promise<T>;
}> {
  const baseURL = getBaseUrl();
  const token = await authStorage.getAccessToken();
  if (!token) {
    throw new Error('No access token available. Please log in.');
  }

  return {
    async get<T>(path: string): Promise<T> {
      const url = path.startsWith('http') ? path : `${baseURL}${path.startsWith('/') ? path : `/${path}`}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<T>;
    },

    async post<T>(path: string, data: unknown): Promise<T> {
      const url = path.startsWith('http') ? path : `${baseURL}${path.startsWith('/') ? path : `/${path}`}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
      }
      if (res.status === 204) return {} as T;
      return res.json() as Promise<T>;
    },
  };
}
