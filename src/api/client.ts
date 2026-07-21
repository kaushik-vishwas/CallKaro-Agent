import {getApiBaseUrl} from '../config/env';

const TOKEN_KEY = 'callkaro_agent_token';

export {getApiBaseUrl};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
} & T;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError('Invalid server response.', response.status);
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message || `Request failed (${response.status})`,
      payload?.statusCode || response.status,
    );
  }

  // Backend `ok()` spreads data at top level AND under data
  if (payload.data !== undefined) return payload.data;
  const {success: _s, message: _m, statusCode: _c, ...rest} = payload as ApiResponse<T> &
    Record<string, unknown>;
  return rest as T;
}
