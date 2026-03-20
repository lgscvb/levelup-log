import {
  createServer,
  type Server,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { URL } from "node:url";
import { CONFIG } from "../utils/config.js";
import { log, logError } from "../utils/logger.js";

interface OAuthResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Exchange a PKCE authorization code for tokens via Supabase GoTrue.
 */
async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
): Promise<OAuthResult> {
  const response = await fetch(
    `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=pkce`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CONFIG.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        auth_code: code,
        code_verifier: codeVerifier,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  if (!data.access_token || !data.refresh_token) {
    throw new Error("Token exchange response missing tokens");
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in ?? 3600,
  };
}

/**
 * Start a temporary localhost HTTP server to receive the OAuth callback.
 * Handles both PKCE flow (?code=xxx) and implicit flow (#access_token=xxx).
 */
export function startOAuthCallbackServer(
  codeVerifier: string,
): Promise<OAuthResult> {
  return new Promise((resolve, reject) => {
    const port = CONFIG.AUTH_PORT;
    let server: Server;
    const timeout = setTimeout(
      () => {
        server?.close();
        reject(new Error("OAuth login timed out after 5 minutes"));
      },
      5 * 60 * 1000,
    );

    const succeed = (result: OAuthResult) => {
      clearTimeout(timeout);
      server.close();
      resolve(result);
    };

    const fail = (err: Error) => {
      clearTimeout(timeout);
      server.close();
      reject(err);
    };

    server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || "/", `http://localhost:${port}`);

      if (url.pathname === "/callback") {
        // PKCE flow: Supabase redirects with ?code=xxx
        const code = url.searchParams.get("code");
        if (code) {
          try {
            log("Received PKCE code, exchanging for tokens...");
            const result = await exchangeCodeForTokens(code, codeVerifier);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`
              <html>
                <body style="font-family: system-ui; text-align: center; padding: 50px; background: #0a0a0a; color: #e5e5e5;">
                  <h1>LevelUp.log</h1>
                  <p style="color: #34d399; font-size: 1.5em;">Login successful!</p>
                  <p>You can close this window and return to your LLM tool.</p>
                </body>
              </html>
            `);
            succeed(result);
          } catch (err) {
            logError("PKCE token exchange failed:", err);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`
              <html>
                <body style="font-family: system-ui; text-align: center; padding: 50px; background: #0a0a0a; color: #e5e5e5;">
                  <h1>LevelUp.log</h1>
                  <p style="color: #ef4444; font-size: 1.5em;">Login failed</p>
                  <p>${err instanceof Error ? err.message : "Token exchange failed"}</p>
                </body>
              </html>
            `);
            fail(err instanceof Error ? err : new Error(String(err)));
          }
          return;
        }

        // Implicit flow: tokens in query params (forwarded from fragment)
        const accessToken = url.searchParams.get("access_token");
        const refreshToken = url.searchParams.get("refresh_token");
        const expiresIn = url.searchParams.get("expires_in");

        if (accessToken && refreshToken) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 50px; background: #0a0a0a; color: #e5e5e5;">
                <h1>LevelUp.log</h1>
                <p style="color: #34d399; font-size: 1.5em;">Login successful!</p>
                <p>You can close this window and return to your LLM tool.</p>
              </body>
            </html>
          `);
          succeed({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: parseInt(expiresIn || "3600", 10),
          });
        } else {
          // Last resort: try fragment extraction via JavaScript
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body>
                <script>
                  const hash = window.location.hash.substring(1);
                  if (hash) {
                    window.location.href = '/callback?' + hash;
                  } else {
                    document.body.innerHTML = '<p style="font-family: system-ui; text-align: center; padding: 50px;">Login failed. No tokens received.</p>';
                  }
                </script>
              </body>
            </html>
          `);
        }
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.listen(port, "127.0.0.1", () => {
      log(`OAuth callback server listening on http://127.0.0.1:${port}`);
    });

    server.on("error", (err) => {
      clearTimeout(timeout);
      reject(
        new Error(
          `Failed to start OAuth server on port ${port}: ${err.message}`,
        ),
      );
    });
  });
}
