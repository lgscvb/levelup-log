import {
  createServer,
  type Server,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { URL } from "node:url";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "../utils/config.js";
import { log, logError } from "../utils/logger.js";

interface OAuthResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Start a temporary localhost HTTP server to receive the OAuth callback.
 * Uses Supabase client's native PKCE flow via exchangeCodeForSession.
 * Also handles implicit flow (#access_token=xxx) as fallback.
 */
export function startOAuthCallbackServer(
  supabase: SupabaseClient,
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
      log(`Callback received: ${url.pathname}${url.search}`);

      if (url.pathname === "/callback") {
        // Check for error from GoTrue first
        const errorParam = url.searchParams.get("error");
        const errorDescription =
          url.searchParams.get("error_description") ||
          url.searchParams.get("error_code");
        if (errorParam) {
          const msg = errorDescription
            ? `${errorParam}: ${errorDescription}`
            : errorParam;
          logError("OAuth error from provider:", msg);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 50px; background: #0a0a0a; color: #e5e5e5;">
                <h1>LevelUp.log</h1>
                <p style="color: #ef4444; font-size: 1.5em;">Login failed</p>
                <p>${msg}</p>
              </body>
            </html>
          `);
          fail(new Error(`OAuth error: ${msg}`));
          return;
        }

        // PKCE flow: Supabase redirects with ?code=xxx
        const code = url.searchParams.get("code");
        if (code) {
          try {
            log("Received PKCE code, exchanging for session...");
            const { data, error } =
              await supabase.auth.exchangeCodeForSession(code);

            if (error || !data.session) {
              throw new Error(
                error?.message || "No session returned from code exchange",
              );
            }

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
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token ?? "",
              expires_in: data.session.expires_in ?? 3600,
            });
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
                  var hash = window.location.hash.substring(1);
                  if (hash) {
                    window.location.href = '/callback?' + hash;
                  } else {
                    document.body.innerHTML = '<div style="font-family: system-ui; text-align: center; padding: 50px; background: #0a0a0a; color: #e5e5e5;">' +
                      '<h1>LevelUp.log</h1>' +
                      '<p style="color: #ef4444; font-size: 1.5em;">Login failed</p>' +
                      '<p>No tokens received. Please check Supabase redirect URL settings.</p>' +
                      '<p style="color: #888; font-size: 0.9em;">Expected redirect URL: ' + window.location.origin + '/callback</p>' +
                      '</div>';
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
