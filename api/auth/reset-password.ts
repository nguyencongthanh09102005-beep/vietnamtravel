import { dbOne, dbQuery, hashPassword, json, nowSeconds, sha256 } from '../_lib/auth.js';

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    let body: { token?: unknown; password?: unknown };
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }
    const token = typeof body?.token === 'string' ? body.token : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (token.length < 30 || token.length > 128 || password.length < 8 || password.length > 128) {
      return json({ error: 'Liên kết không hợp lệ hoặc mật khẩu chưa đủ 8 ký tự.' }, 400);
    }

    try {
      const tokenHash = sha256(token);
      const row = await dbOne('SELECT user_id FROM password_resets WHERE token_hash=? AND consumed_at IS NULL AND expires_at>?', [tokenHash, nowSeconds()]);
      if (!row) return json({ error: 'Liên kết khôi phục không còn hợp lệ.' }, 401);
      const claim = await dbQuery('UPDATE password_resets SET consumed_at=? WHERE token_hash=? AND consumed_at IS NULL',
        [nowSeconds(), tokenHash]);
      if (!claim.changes) return json({ error: 'Liên kết đã được sử dụng.' }, 401);
      const hash = await hashPassword(password);
      await dbQuery('UPDATE users SET password_hash=? WHERE id=?', [hash, String(row.user_id)]);
      await dbQuery('DELETE FROM sessions WHERE user_id=?', [String(row.user_id)]);
      return json({ message: 'Đặt lại mật khẩu thành công. Hãy đăng nhập lại.' });
    } catch (error) {
      console.error('[auth/reset-password] error:', error);
      return json({ error: 'Không đặt lại được mật khẩu lúc này.' }, 503);
    }
  },
};
