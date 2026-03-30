/**
 * Auth microservice HTTP client.
 * Uses token-based auth (Bearer) for React Native - no cookies.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as authStorage from './auth.storage';

const AUTH_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1`;

let authClient: AxiosInstance | null = null;

export function getAuthClient(): AxiosInstance {
  if (!authClient) {
    authClient = axios.create({
      baseURL: AUTH_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    authClient.interceptors.request.use(async (config) => {
      const token = await authStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  return authClient;
}

export class AuthHttpError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthHttpError';
  }
}

export function isAuthError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string })?.message;
    return msg || error.message || 'Error de autenticación';
  }
  return error instanceof Error ? error.message : 'Error desconocido';
}
