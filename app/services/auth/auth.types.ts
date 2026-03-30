/**
 * Auth types - compatible with Supabase Session/User for easier migration.
 */

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  email_confirmed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user: AuthUser;
}

export interface AuthResponse {
  data?: {
    session: AuthSession;
    user: AuthUser;
  };
  error?: { message: string; code?: string };
}

/** MFA factor from auth microservice */
export interface MfaFactor {
  id: string;
  type?: string;
  status?: string;
  friendlyName?: string;
  createdAt?: string;
  factor?: Record<string, unknown>;
}
