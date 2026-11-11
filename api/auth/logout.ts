import { clearedCookies, getRequestAuthSession, json, revokeSession } from '../_lib/auth.js';

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    try { await revokeSession(await getRequestAuthSession(request)); }
    catch (error) { console.error('[auth/logout] session revocation error:', error); }
    return json({ ok: true }, 200, clearedCookies());
  },
};
