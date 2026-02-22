import { CONFIG } from './config.js';
import { getValidToken } from '../auth/manager.js';
import { logError } from './logger.js';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiGet<T = unknown>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  const token = await getValidToken();
  const url = new URL(`${CONFIG.SUPABASE_URL}/functions/v1/${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        apikey: CONFIG.SUPABASE_ANON_KEY,
      },
    });

    const body = await res.json();
    if (!res.ok) {
      return { error: body.error || `HTTP ${res.status}`, status: res.status };
    }
    return { data: body as T, status: res.status };
  } catch (error) {
    logError('API GET error:', error);
    return { error: (error as Error).message, status: 0 };
  }
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const token = await getValidToken();
  const url = `${CONFIG.SUPABASE_URL}/functions/v1/${path}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        apikey: CONFIG.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || `HTTP ${res.status}`, status: res.status };
    }
    return { data: data as T, status: res.status };
  } catch (error) {
    logError('API POST error:', error);
    return { error: (error as Error).message, status: 0 };
  }
}
