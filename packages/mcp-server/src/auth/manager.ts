import { createClient } from "@supabase/supabase-js";
import { loadTokens, saveTokens, clearTokens } from "./keychain.js";
import { startOAuthCallbackServer } from "./oauth-server.js";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce.js";
import { CONFIG } from "../utils/config.js";
import { log, logError } from "../utils/logger.js";

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get a valid access token. Will:
 * 1. Return cached token if still valid
 * 2. Try to refresh from stored refresh token
 * 3. Initiate full OAuth login flow if needed
 */
export async function getValidToken(): Promise<string> {
  // Check memory cache
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  // Try stored tokens
  const stored = loadTokens();
  if (stored) {
    if (Date.now() < stored.expires_at - 60_000) {
      cachedAccessToken = stored.access_token;
      tokenExpiresAt = stored.expires_at;
      return stored.access_token;
    }

    // Try refresh
    if (stored.refresh_token) {
      try {
        const refreshed = await refreshToken(stored.refresh_token);
        if (refreshed) return refreshed;
      } catch (error) {
        logError("Token refresh failed:", error);
      }
    }
  }

  // Full login required
  return await login();
}

async function refreshToken(refreshTokenValue: string): Promise<string | null> {
  const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshTokenValue,
  });

  if (error || !data.session) {
    logError("Refresh failed:", error?.message);
    return null;
  }

  const expiresAt = Date.now() + (data.session.expires_in ?? 3600) * 1000;
  cachedAccessToken = data.session.access_token;
  tokenExpiresAt = expiresAt;

  saveTokens({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token ?? refreshTokenValue,
    expires_at: expiresAt,
  });

  log("Token refreshed successfully");
  return data.session.access_token;
}

async function login(): Promise<string> {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    throw new Error(
      "LevelUp.log is not configured. Run `npx @levelup-log/mcp-server init` to set up.",
    );
  }

  const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Start callback server before opening browser (pass codeVerifier for PKCE exchange)
  const callbackPromise = startOAuthCallbackServer(codeVerifier);

  const redirectTo = `http://127.0.0.1:${CONFIG.AUTH_PORT}/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      },
    },
  });

  if (error || !data.url) {
    throw new Error(
      `Failed to initiate OAuth: ${error?.message ?? "No URL returned"}`,
    );
  }

  // Open browser
  const open = await import("open");
  await open.default(data.url);
  console.error("Opening browser for Google login...");

  // Wait for callback
  const result = await callbackPromise;
  const expiresAt = Date.now() + result.expires_in * 1000;

  cachedAccessToken = result.access_token;
  tokenExpiresAt = expiresAt;

  saveTokens({
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_at: expiresAt,
  });

  log("Login successful");
  return result.access_token;
}

export function isAuthenticated(): boolean {
  const stored = loadTokens();
  return !!(stored && Date.now() < stored.expires_at - 60_000);
}

export function logout(): void {
  cachedAccessToken = null;
  tokenExpiresAt = 0;
  clearTokens();
  log("Logged out");
}
