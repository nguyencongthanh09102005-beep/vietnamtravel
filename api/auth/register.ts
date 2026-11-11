import { createSession, dbQuery, hashPassword, json, makeId, normalizeEmail, sessionCookie, validEmail, validProfileName, withinRateLimit } from '../_lib/auth.js';

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    let body: { email?: unknown; password?: unknown; displayName?: unknown };
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu đăng ký không hợp lệ.' }, 400); }

    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === 'string' ? body.password : '';
    const displayName = typeof body?.displayName === 'string' ? body.displayName.trim() : '';
    if (!validEmail(email) || !validProfileName(displayName) || password.length < 8 || password.length > 128) {
      return json({ error: 'Cần tên 2–80 ký tự, email hợp lệ và mật khẩu 8–128 ký tự.' }, 400);
    }
    try {
      if (!await withinRateLimit(request, 'register', '', 5, 3600)) {
        return json({ error: 'Đăng ký quá nhiều lần. Hãy thử lại sau.' }, 429);
      }
      const userId = makeId();
      const passwordHash = await hashPassword(password);
      await dbQuery(
        'INSERT INTO users (id,email,password_hash,display_name,created_at) VALUES (?,?,?,?,?)',
        [userId, email, passwordHash, displayName, new Date().toISOString()],
      );
      const token = await createSession(userId);
      return json({
        user: { id: userId, email, displayName, avatarUrl: null, createdAt: new Date().toISOString() },
        needsEmailConfirmation: false,
      }, 200, [sessionCookie(token)]);
    } catch (error) {
      const details = String(error);
      if (/UNIQUE|constraint failed|SQLITE_CONSTRAINT/i.test(details)) {
        return json({ error: 'Email này đã có tài khoản. Hãy thử đăng nhập.' }, 409);
      }
      console.error('[auth/register] database error:', error);
      return json({ error: 'Không tạo được tài khoản. Kiểm tra database hoặc thử lại.' }, 503);
    }
  },
};
