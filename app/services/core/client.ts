/**
 * Core microservice HTTP client.
 * Uses API Gateway with encrypted requests.
 * Base path: /gateway/core/v1
 */

import { gatewayPost } from '../gateway';
import * as authStorage from '../auth/auth.storage';

const CORE_PATH_PREFIX = 'v1';

export interface CoreClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, data?: Record<string, unknown>): Promise<T>;
}

let coreClient: CoreClient | null = null;

async function request<T>(
  method: 'get' | 'post',
  path: string,
  data?: Record<string, unknown>
): Promise<T> {
  const token = await authStorage.getAccessToken();
  if (!token) {
    throw new Error('No access token available. Please log in.');
  }
  const fullPath = path.startsWith('v1/') ? path : `${CORE_PATH_PREFIX}/${path.replace(/^\//, '')}`;
  return gatewayPost<T>('core', fullPath, {
    accessToken: token,
    method: method === 'get' ? 'GET' : 'POST',
    data: method === 'post' ? data : (data ?? {}),
  });
}

export function getCoreClient(): CoreClient {
  if (!coreClient) {
    coreClient = {
      get<T>(path: string): Promise<T> {
        return request<T>('get', path, {});
      },
      post<T>(path: string, data?: Record<string, unknown>): Promise<T> {
        return request<T>('post', path, data);
      },
    };
  }
  return coreClient;
}
