import {
  appendCookies,
  clearAuthCookies,
  getRequestAuthSession,
  getSupabaseConfig,
} from '../_lib/supabase';

function json(data: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  appendCookies(headers, cookies);
  return Response.json(data, { status, headers });
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

    const config = getSupabaseConfig();
    if (!config.configured) return json({ configured: false, user: null });

    try {
      const session = await getRequestAuthSession(request);
      if (!session) return json({ configured: true, user: null }, 200, clearAuthCookies());
      return json({ configured: true, user: session.user }, 200, session.cookies);
    } catch (error) {
      console.error('Auth session error:', error);
      return json({ configured: true, user: null }, 200, clearAuthCookies());
    }
  },
};
