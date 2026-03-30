/**
 * Payment Services – via Gateway only.
 * Sends: access key (JWT inside encrypted payload), orchestrator path, and encrypted body (payload + iv).
 * Gateway validates key, routes to payment-services-orchestrator, and handles encrypt/decrypt.
 * Paths must match the orchestrator API (e.g. api/payment-services/transactions/send).
 */

import * as authStorage from '../auth/auth.storage';
import { gatewayPost } from '../gateway/gateway.client';

export async function getPaymentServicesClient(): Promise<{
  get: <T>(path: string) => Promise<T>;
  post: <T>(path: string, data: unknown) => Promise<T>;
}> {
  const token = await authStorage.getAccessToken();
  if (!token) {
    throw new Error('No access token available. Please log in.');
  }

  return {
    async get<T>(path: string): Promise<T> {
      const normalized = path.replace(/^\//, '');
      const pathOnly = normalized.split('?')[0];
      const query = normalized.includes('?') ? normalized.slice(normalized.indexOf('?')) : '';
      const res = await gatewayPost<T>(
        'payment-services',
        pathOnly + query,
        { accessToken: token, method: 'GET', data: {} }
      );
      return res;
    },

    async post<T>(path: string, data: unknown): Promise<T> {
      const pathOnly = path.replace(/^\//, '').split('?')[0];
      const res = await gatewayPost<T>(
        'payment-services',
        pathOnly,
        { accessToken: token, method: 'POST', data: (data ?? {}) as Record<string, unknown> }
      );
      return res;
    },
  };
}
