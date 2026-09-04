import {
  appendCookies,
  clearAuthCookies,
  getRequestAuthSession,
  getSupabaseConfig,
  supabaseAuthFetch,
} from '../_lib/supabase';

function json(data: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  appendCookies(headers, cookies);
  return Response.json(data, { status, headers });
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    if (getSupabaseConfig().configured) {
      try {
        const session = await getRequestAuthSession(request);
        if (session?.accessToken) {
          await supabaseAuthFetch('/auth/v1/logout', { method: 'POST' }, session.accessToken);
        }
      } catch (error) {
        console.error('Supabase logout error:', error);
      }
    }

    return json({ ok: true }, 200, clearAuthCookies());
  },
};
