import { createSession, dbOne, hashPassword, json, normalizeEmail, publicUser, sessionCookie, validEmail, verifyPassword, withinRateLimit } from '../_lib/auth.js';

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    let body: { email?: unknown; password?: unknown };
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu đăng nhập không hợp lệ.' }, 400); }

    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!validEmail(email) || !password || password.length > 128) return json({ error: 'Hãy nhập email và mật khẩu hợp lệ.' }, 400);

    try {
      if (!await withinRateLimit(request, 'login', email, 10, 15 * 60)) {
        return json({ error: 'Thử đăng nhập quá nhiều lần. Hãy thử lại sau 15 phút.' }, 429);
      }
      const row = await dbOne('SELECT * FROM users WHERE email=?', [email]);
      // Perform an equally expensive hash on unknown users to reduce timing leaks.
      const valid = row
        ? await verifyPassword(password, String(row.password_hash))
        : (await hashPassword(password), false);
      if (!valid || !row) return json({ error: 'Email hoặc mật khẩu chưa đúng.' }, 401);
      const token = await createSession(String(row.id));
      return json({ user: publicUser(row) }, 200, [sessionCookie(token)]);
    } catch (error) {
      console.error('[auth/login] database error:', error);
      return json({ error: 'Không kết nối được database tài khoản. Hãy kiểm tra cấu hình.' }, 503);
    }
  },
};
