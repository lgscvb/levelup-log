import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  loadTokens: vi.fn(),
  saveTokens: vi.fn(),
  clearTokens: vi.fn(),
  startOAuthCallbackServer: vi.fn(),
  log: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: mocks.createClient,
}));

vi.mock("../src/auth/keychain.js", () => ({
  loadTokens: mocks.loadTokens,
  saveTokens: mocks.saveTokens,
  clearTokens: mocks.clearTokens,
}));

vi.mock("../src/auth/oauth-server.js", () => ({
  startOAuthCallbackServer: mocks.startOAuthCallbackServer,
}));

vi.mock("../src/utils/config.js", () => ({
  CONFIG: {
    SUPABASE_URL: "https://test.supabase.co",
    SUPABASE_ANON_KEY: "test-anon-key",
    AUTH_PORT: 19876,
    DEBUG: false,
    GOOGLE_EMAIL: "",
  },
}));

vi.mock("../src/utils/logger.js", () => ({
  log: mocks.log,
  logError: mocks.logError,
}));

describe("auth manager", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("shares one refresh request across concurrent token lookups", async () => {
    const refreshSession = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                session: {
                  access_token: "fresh-access-token",
                  refresh_token: "fresh-refresh-token",
                  expires_in: 3600,
                },
              },
              error: null,
            });
          }, 10);
        }),
    );

    mocks.createClient.mockReturnValue({
      auth: { refreshSession },
    });
    mocks.loadTokens.mockReturnValue({
      access_token: "expired-access-token",
      refresh_token: "stored-refresh-token",
      expires_at: Date.now() - 1_000,
    });

    const { getValidToken } = await import("../src/auth/manager.js");

    const results = await Promise.all([
      getValidToken(),
      getValidToken(),
      getValidToken(),
    ]);

    expect(results).toEqual([
      "fresh-access-token",
      "fresh-access-token",
      "fresh-access-token",
    ]);
    expect(refreshSession).toHaveBeenCalledOnce();
    expect(refreshSession).toHaveBeenCalledWith({
      refresh_token: "stored-refresh-token",
    });
    expect(mocks.saveTokens).toHaveBeenCalledOnce();
  });

  it("uses a valid stored access token without opening OAuth", async () => {
    mocks.loadTokens.mockReturnValue({
      access_token: "stored-access-token",
      refresh_token: "stored-refresh-token",
      expires_at: Date.now() + 3_600_000,
    });

    const { getValidToken } = await import("../src/auth/manager.js");

    await expect(getValidToken()).resolves.toBe("stored-access-token");
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.startOAuthCallbackServer).not.toHaveBeenCalled();
  });
});
