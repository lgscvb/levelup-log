import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { CONFIG } from '../utils/config.js';
import { log } from '../utils/logger.js';

interface OAuthResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Start a temporary localhost HTTP server to receive the OAuth callback.
 * Opens browser → Google OAuth → redirect to localhost:PORT/callback → extract tokens → close server.
 */
export function startOAuthCallbackServer(): Promise<OAuthResult> {
  return new Promise((resolve, reject) => {
    const port = CONFIG.AUTH_PORT;
    let server: Server;
    const timeout = setTimeout(() => {
      server?.close();
      reject(new Error('OAuth login timed out after 5 minutes'));
    }, 5 * 60 * 1000);

    server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || '/', `http://localhost:${port}`);

      if (url.pathname === '/callback') {
        // Supabase redirects with fragment (#), but we need query params
        // The frontend redirect page will forward fragment params as query params
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');
        const expiresIn = url.searchParams.get('expires_in');

        if (accessToken && refreshToken) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding: 50px; background: #0a0a0a; color: #e5e5e5;">
                <h1>LevelUp.log</h1>
                <p style="color: #34d399; font-size: 1.5em;">Login successful!</p>
                <p>You can close this window and return to your LLM tool.</p>
              </body>
            </html>
          `);

          clearTimeout(timeout);
          server.close();
          resolve({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: parseInt(expiresIn || '3600', 10),
          });
        } else {
          // Serve a page that extracts fragment params and redirects as query params
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body>
                <script>
                  const hash = window.location.hash.substring(1);
                  if (hash) {
                    window.location.href = '/callback?' + hash;
                  } else {
                    document.body.innerHTML = '<p>Login failed. No tokens received.</p>';
                  }
                </script>
              </body>
            </html>
          `);
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(port, '127.0.0.1', () => {
      log(`OAuth callback server listening on http://127.0.0.1:${port}`);
    });

    server.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start OAuth server on port ${port}: ${err.message}`));
    });
  });
}
