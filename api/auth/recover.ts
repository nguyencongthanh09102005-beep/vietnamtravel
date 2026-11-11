import { dbOne, dbQuery, json, makeToken, normalizeEmail, sha256, validEmail, withinRateLimit, nowSeconds } from '../_lib/auth.js';

const responseMessage = 'Nếu email đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu.';
export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    let body: { email?: unknown };
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }
    const email = normalizeEmail(body?.email);
    if (!validEmail(email)) return json({ error: 'Email chưa đúng định dạng.' }, 400);

    if (!process.env.RESEND_API_KEY || !process.env.AUTH_EMAIL_FROM) {
      return json({ error: 'Chưa cấu hình gửi email khôi phục. Liên hệ quản trị viên.' }, 503);
    }

    try {
      if (!await withinRateLimit(request, 'recover', email, 3, 3600)) {
        return json({ message: responseMessage });
      }
      const row = await dbOne('SELECT id FROM users WHERE email=?', [email]);
      if (!row) return json({ message: responseMessage });

      const token = makeToken();
      const hash = sha256(token);
      await dbQuery('DELETE FROM password_resets WHERE user_id=?', [String(row.id)]);
      await dbQuery('INSERT INTO password_resets (token_hash,user_id,expires_at) VALUES (?,?,?)',
        [hash, String(row.id), nowSeconds() + 20 * 60]);

      const base = process.env.AUTH_PUBLIC_URL || new URL(request.url).origin;
      const link = new URL('/', base);
      link.hash = 'type=recovery&access_token=' + encodeURIComponent(token);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          from: process.env.AUTH_EMAIL_FROM,
          to: [email],
          subject: 'Đặt lại mật khẩu VietnamTravel',
          text: 'Nhấn liên kết để đặt lại mật khẩu (hết hạn sau 20 phút): ' + link.toString(),
        }),
      });
      if (!response.ok) throw new Error('Email provider returned ' + response.status);
      return json({ message: responseMessage });
    } catch (error) {
      console.error('[auth/recover] error:', error);
      return json({ error: 'Không gửi được email lúc này. Hãy thử lại sau.' }, 503);
    }
  },
};
