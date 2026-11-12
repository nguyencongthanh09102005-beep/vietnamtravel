import path from 'node:path';
import type { AddressInfo } from 'node:net';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Development-only adapter for the same Request/Response handlers deployed as
 * Vercel Functions in production. No Vercel CLI account or project link needed.
 * Secrets stay inside the Node process and are never exposed via VITE_*.
 */
function localApi(): Plugin {
  const endpoints: Record<string, string> = {
    '/api/ai': '/api/ai.ts',
    '/api/content': '/api/content.ts',
    '/api/itineraries': '/api/itineraries.ts',
    '/api/itineraries/generate': '/api/itineraries/generate.ts',
    '/api/itineraries/locations': '/api/itineraries/locations.ts',
    '/api/user-data': '/api/user-data.ts',
    '/api/auth/login': '/api/auth/login.ts',
    '/api/auth/register': '/api/auth/register.ts',
    '/api/auth/logout': '/api/auth/logout.ts',
    '/api/auth/me': '/api/auth/me.ts',
    '/api/auth/recover': '/api/auth/recover.ts',
    '/api/auth/reset-password': '/api/auth/reset-password.ts',
    '/api/auth/profile': '/api/auth/profile.ts',
  };

  return {
    name: 'vietnamtravel-local-api',
    apply: 'serve',
    configureServer(server) {
      // loadEnv with prefix '' reads private values too; do not return these
      // values in the Vite config or expose them to client-side code.
      const env = loadEnv(server.config.mode, server.config.root, '');
      for (const key of ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'LOCAL_DB_PATH',
        'RESEND_API_KEY', 'AUTH_EMAIL_FROM', 'AUTH_PUBLIC_URL',
        'GEMINI_API_KEY', 'GEMINI_MODEL', 'GEMINI_FALLBACK_MODEL', 'GOOGLE_MAPS_API_KEY']) {
        if (process.env[key] === undefined && env[key] !== undefined) {
          process.env[key] = env[key];
        }
      }

      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
        if (!pathname.startsWith('/api/')) return next();

        const modulePath = endpoints[pathname];
        if (!modulePath) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'API endpoint not found' }));
          return;
        }

        try {
          const module = await server.ssrLoadModule(modulePath);
          const handler = module.default as { fetch: (request: Request) => Promise<Response> };
          if (typeof handler?.fetch !== 'function') throw new Error('Invalid API handler');

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          }

          const method = req.method ?? 'GET';
          const chunks: Buffer[] = [];
          let total = 0;
          if (method !== 'GET' && method !== 'HEAD') {
            for await (const chunk of req) {
              const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
              total += buffer.length;
              if (total > 1_048_576) {
                res.statusCode = 413;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: 'Request is too large' }));
                return;
              }
              chunks.push(buffer);
            }
          }

          const request = new Request(
            new URL(req.url ?? '/', 'http://localhost:' + (server.httpServer?.address() as AddressInfo | null)?.port).toString(),
            {
              method,
              headers,
              body: chunks.length ? Buffer.concat(chunks) : undefined,
            },
          );

          const response = await handler.fetch(request);
          res.statusCode = response.status;
          response.headers.forEach((value: string, name: string) => {
            if (name !== 'set-cookie') res.setHeader(name, value);
          });
          const cookies = response.headers.getSetCookie();
          if (cookies.length) res.setHeader('Set-Cookie', cookies);
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          console.error('[local API] ' + pathname, error);
          if (!res.headersSent) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'API gặp sự cố kết nối. Kiểm tra cấu hình và Terminal.' }));
          } else {
            res.end();
          }
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
});
