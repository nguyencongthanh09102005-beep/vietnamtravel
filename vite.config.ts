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
    '/api/content/refresh': '/api/content/refresh.ts',
    '/api/content/review': '/api/content/review.ts',
    '/api/administration/check': '/api/administration/check.ts',
    '/api/administration/aliases': '/api/administration/aliases.ts',
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
        'GEMINI_API_KEY', 'GEMINI_MODEL', 'GEMINI_FALLBACK_MODEL', 'GOOGLE_MAPS_API_KEY',
        'CRON_SECRET', 'CONTENT_REVIEW_SECRET', 'LOCAL_SOURCE_AI_CLASSIFY']) {
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

/**
 * Non-blocking enrichment for localhost, independent of Vercel Cron and Gemini.
 * The source scanner runs only while the Vite dev server is open. It refuses to
 * touch a remote Turso database without a separately reviewed deployment.
 * Tests explicitly disable this plugin to remain deterministic.
 */
function localContentEnrichment(): Plugin {
  return {
    name: 'vietnamtravel-local-enrichment',
    apply: 'serve',
    configureServer(server) {
      if (process.env.LOCAL_CONTENT_AUTORUN === '0') return;
      let closed = false;
      let startup: ReturnType<typeof setTimeout> | undefined;
      let daily: ReturnType<typeof setInterval> | undefined;
      let photoStartup: ReturnType<typeof setTimeout> | undefined;
      let feedStartup: ReturnType<typeof setTimeout> | undefined;
      let photoDaily: ReturnType<typeof setInterval> | undefined;
      let feedDaily: ReturnType<typeof setInterval> | undefined;
      let photoBusy = false, feedBusy = false;
      const localOnly = () => !closed && !process.env.TURSO_DATABASE_URL?.trim() &&
        !process.env.TURSO_AUTH_TOKEN?.trim();
      const photos = async () => {
        if (!localOnly() || photoBusy) return;
        photoBusy = true;
        try {
          const { repairMissingPhotos } = await server.ssrLoadModule('/api/_lib/photo-repair.ts');
          const report = await repairMissingPhotos({ maxItems: 25 });
          if (report.updated) console.info('[VietnamTravel] Licensed photographs added:', report.updated);
        } catch(error) {
          console.warn('[VietnamTravel] Photo repair skipped:', error);
        } finally {photoBusy = false;}
      };
      const sources = async () => {
        if (!localOnly() || feedBusy) return;
        feedBusy = true;
        try {
          const { scanTrustedNewsFeeds } = await server.ssrLoadModule('/api/_lib/trusted-feeds.ts');
          const report = await scanTrustedNewsFeeds({
            withAi: process.env.LOCAL_SOURCE_AI_CLASSIFY === '1',
          });
          if (report.inserted) console.info('[VietnamTravel] New trusted news leads awaiting review:', report.inserted);
        } catch(error) {
          console.warn('[VietnamTravel] RSS metadata scan skipped:', error);
        } finally {feedBusy = false;}
      };
      const run = async () => {
        if (closed) return;
        if (process.env.TURSO_DATABASE_URL?.trim()) {
          console.info('[VietnamTravel] Local auto-enrichment skipped: remote Turso is configured. Use the authorized server-side cron instead.');
          return;
        }
        try {
          const { enrichAll } = await server.ssrLoadModule('/api/_lib/auto-enrich.ts');
          const summaries = await enrichAll({
            shouldStop: () => closed,
            onProgress: (item: { provinceId: string; section: string; approved: number; pending: number; errors: number }) => {
              if (item.approved || item.pending || item.errors) {
                console.info('[VietnamTravel content]', item.provinceId, item.section,
                  'added:', item.approved, 'needs review:', item.pending, 'errors:', item.errors);
              }
            },
          });
          const published = summaries.reduce((sum: number, x: { approved: number }) => sum + x.approved, 0);
          console.info('[VietnamTravel content] Scan finished. New verified entries:', published,
            '· Reload the province tab to view new cards.');
        } catch (error) {
          console.warn('[VietnamTravel content] Local source scan unavailable:', error);
        }
      };
      server.httpServer?.once('listening', () => {
        startup = setTimeout(() => { void run(); }, 5000);
        daily = setInterval(() => { void run(); }, 24 * 3600 * 1000);
        daily.unref?.();
        // Independent from the slower whole-country catalog scan.
        photoStartup = setTimeout(() => { void photos(); }, 9000);
        feedStartup = setTimeout(() => { void sources(); }, 16000);
        photoDaily = setInterval(() => { void photos(); }, 24 * 3600 * 1000);
        feedDaily = setInterval(() => { void sources(); }, 24 * 3600 * 1000);
        photoDaily.unref?.(); feedDaily.unref?.();
      });
      server.httpServer?.once('close', () => {
        closed = true;
        if (startup) clearTimeout(startup);
        if (daily) clearInterval(daily);
        if (photoStartup) clearTimeout(photoStartup);
        if (feedStartup) clearTimeout(feedStartup);
        if (photoDaily) clearInterval(photoDaily);
        if (feedDaily) clearInterval(feedDaily);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApi(), localContentEnrichment()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
});
