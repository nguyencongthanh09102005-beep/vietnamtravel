import { avatarUrlOk, dbOne, dbQuery, getRequestAuthSession, json, publicUser, validProfileName } from '../_lib/auth.js';

export default {
  async fetch(request: Request) {
    if (request.method !== 'PATCH') return json({ error: 'Method not allowed' }, 405);
    try {
      const session = await getRequestAuthSession(request);
      if (!session) return json({ error: 'Bạn cần đăng nhập để cập nhật hồ sơ.' }, 401);

      let body: { displayName?: unknown; avatarUrl?: unknown };
      try { body = await request.json(); }
      catch { return json({ error: 'Dữ liệu hồ sơ không hợp lệ.' }, 400); }

      const name = typeof body?.displayName === 'string' ? body.displayName.trim() : '';
      const avatarUrl = typeof body?.avatarUrl === 'string' ? body.avatarUrl.trim() : '';
      if (!validProfileName(name) || !avatarUrlOk(avatarUrl)) {
        return json({ error: 'Tên cần 2–80 ký tự; avatar phải là URL HTTPS tối đa 500 ký tự.' }, 400);
      }
      await dbQuery('UPDATE users SET display_name=?, avatar_url=? WHERE id=?', [name, avatarUrl || null, session.user.id]);
      const updated = await dbOne('SELECT * FROM users WHERE id=?', [session.user.id]);
      return json({ user: publicUser(updated!) });
    } catch (error) {
      console.error('[auth/profile] error:', error);
      return json({ error: 'Không cập nhật được hồ sơ. Kiểm tra kết nối database.' }, 503);
    }
  },
};
