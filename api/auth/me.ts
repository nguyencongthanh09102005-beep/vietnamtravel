import { clearedCookies, databaseConfigured, getRequestAuthSession, json } from '../_lib/auth.js';

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
    if (!databaseConfigured()) return json({ configured: false, user: null });
    try {
      const session = await getRequestAuthSession(request);
      if (!session) return json({ configured: true, user: null }, 200, clearedCookies());
      return json({ configured: true, user: session.user });
    } catch (error) {
      console.error('[auth/me] error:', error);
      return json({ configured: true, user: null, error: 'Không kết nối được database.' }, 503);
    }
  },
};
