import { getSupabaseConfig, supabaseAuthFetch } from '../_lib/supabase.js';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!getSupabaseConfig().configured) return json({ error: 'Tài khoản chưa được cấu hình.' }, 503);

    let body: { token?: string; password?: string };
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }

    const token = typeof body?.token === 'string' ? body.token : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!token || token.length > 4096 || password.length < 8 || password.length > 128) {
      return json({ error: 'Liên kết không hợp lệ hoặc mật khẩu chưa đủ 8 ký tự.' }, 400);
    }

    try {
      const response = await supabaseAuthFetch('/auth/v1/user', {
        method: 'PUT',
        body: JSON.stringify({ password }),
      }, token);
      if (!response.ok) return json({ error: 'Liên kết đã hết hạn hoặc không thể cập nhật mật khẩu.' }, 401);
      return json({ message: 'Đã đặt lại mật khẩu. Bạn có thể đăng nhập.' });
    } catch {
      return json({ error: 'Không kết nối được máy chủ.' }, 502);
    }
  },
};
