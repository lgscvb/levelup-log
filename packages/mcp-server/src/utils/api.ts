import { CONFIG } from "./config.js";
import { getValidToken, invalidateCachedToken } from "../auth/manager.js";
import { logError } from "./logger.js";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiGet<T = unknown>(
  path: string,
  params?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const url = new URL(`${CONFIG.SUPABASE_URL}/functions/v1/${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  try {
    return await requestWithAuth<T>((token) =>
      fetch(url.toString(), {
        headers: buildHeaders(token),
      }),
    );
  } catch (error) {
    logError("API GET error:", error);
    return { error: (error as Error).message, status: 0 };
  }
}

export async function apiPost<T = unknown>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  const url = `${CONFIG.SUPABASE_URL}/functions/v1/${path}`;
  const payload = JSON.stringify(body);

  try {
    return await requestWithAuth<T>((token) =>
      fetch(url, {
        method: "POST",
        headers: buildHeaders(token),
        body: payload,
      }),
    );
  } catch (error) {
    logError("API POST error:", error);
    return { error: (error as Error).message, status: 0 };
  }
}

function buildHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    apikey: CONFIG.SUPABASE_ANON_KEY,
  };
}

async function requestWithAuth<T>(
  request: (token: string) => Promise<Response>,
): Promise<ApiResponse<T>> {
  let token = await getValidToken();
  let res = await request(token);

  if (res.status === 401) {
    invalidateCachedToken();
    token = await getValidToken({ forceRefresh: true });
    res = await request(token);
  }

  const body = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    return {
      error: (body.error as string) || `HTTP ${res.status}`,
      status: res.status,
    };
  }
  return { data: body as T, status: res.status };
}
