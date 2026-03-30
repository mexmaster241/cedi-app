/**
 * User API (core microservice)
 * HTTP calls to core /users endpoints via gateway.
 */

import { getCoreClient } from './client';

/**
 * Get user balance from core microservice.
 * POST /gateway/core/v1/users/{id}/balance (encrypted payload with method: "GET")
 */
export async function getBalance(userId: string): Promise<number | null> {
  const client = getCoreClient();
  const res = await client.get<{ balance?: number }>(`/users/${userId}`);
  return res?.balance ?? null;
}
