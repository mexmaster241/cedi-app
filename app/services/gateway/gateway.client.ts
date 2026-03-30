/**
 * Gateway HTTP client.
 * Sends encrypted POST requests to {base}/{service}/{path}.
 * All business calls (core, teams, invoice, onboarding, payment-services) go through this gateway.
 */

import axios, { AxiosError } from 'axios';
import { encryptForGateway, decryptFromGateway } from './gateway.encryption';

/** Allowed service names (first path segment after /gateway) */
export type GatewayService = 'core' | 'teams' | 'invoice' | 'onboarding' | 'payment-services';

/** Gateway base URL. For now only available locally. */
const GATEWAY_BASE_URL = 'http://127.0.0.1:8080/gateway';

export interface GatewayErrorBody {
  status?: number;
  message?: string;
  correlationId?: string;
}

export type GatewayHttpMethod = 'GET' | 'POST';

export interface GatewayRequestOptions {
  /** JWT (access token) for downstream auth */
  accessToken: string;
  /** HTTP method to forward to the backend (inside encrypted payload) */
  method?: GatewayHttpMethod;
  /** Request body sent as inner payload.data */
  data?: Record<string, unknown>;
  /** Optional nonce for replay protection */
  nonce?: string;
}

function buildEncryptedPayload(options: GatewayRequestOptions) {
  const inner = {
    timestamp: Math.floor(Date.now() / 1000),
    nonce: options.nonce ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `n-${Date.now()}-${Math.random().toString(36).slice(2)}`),
    access_token: options.accessToken,
    method: options.method ?? 'POST',
    data: options.data ?? {},
  };
  return encryptForGateway(inner);
}

function handleGatewayResponse<T>(res: { status: number; data: unknown }): T {
  if (res.status >= 200 && res.status < 300) {
    const body = res.data as { payload?: string; iv?: string };
    if (body?.payload && body?.iv) {
      return decryptFromGateway(body.payload, body.iv) as T;
    }
    return res.data as T;
  }
  const errBody = res.data as GatewayErrorBody | undefined;
  const message = errBody?.message ?? `Gateway error ${res.status}`;
  const err = new Error(message) as Error & { status?: number; correlationId?: string };
  err.status = errBody?.status ?? res.status;
  err.correlationId = errBody?.correlationId;
  throw err;
}

function handleGatewayError(e: unknown): never {
  if (axios.isAxiosError(e)) {
    const err = e as AxiosError<GatewayErrorBody>;
    const body = err.response?.data;
    const msg = body?.message ?? err.message ?? 'Gateway request failed';
    const ex = new Error(msg) as Error & { status?: number; correlationId?: string };
    ex.status = err.response?.status;
    ex.correlationId = body?.correlationId;
    throw ex;
  }
  throw e;
}

/**
 * Build inner payload (including method) and encrypt, then POST to gateway.
 * Path is relative to service, e.g. "v1/users/123/balance" for service "core".
 * Backend receives always POST; the decrypted payload contains "method" (GET|POST) for routing.
 */
export async function gatewayPost<T = unknown>(
  service: GatewayService,
  path: string,
  options: GatewayRequestOptions
): Promise<T> {
  const url = `${GATEWAY_BASE_URL}/${service}/${path.replace(/^\//, '')}`;
  const { payload, iv } = buildEncryptedPayload(options);

  try {
    const res = await axios.post(url, { payload, iv }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      validateStatus: () => true,
    });
    return handleGatewayResponse<T>(res);
  } catch (e) {
    handleGatewayError(e);
  }
}
