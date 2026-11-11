import { getSupabaseConfig, supabaseAuthFetch } from '../_lib/supabase.js';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!getSupabaseConfig().configured) return json({ error: 'Tài khoản chưa được cấu hình.' }, 503);

    let body: { email?: string };
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu không hợp lệ.' }, 400); }

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return json({ error: 'Email chưa đúng định dạng.' }, 400);
    }

    try {
      const redirectTo = new URL('/', new URL(request.url).origin).toString();
      const response = await supabaseAuthFetch(
        '/auth/v1/recover?redirect_to=' + encodeURIComponent(redirectTo),
        { method: 'POST', body: JSON.stringify({ email }) },
      );
      if (!response.ok) return json({ error: 'Không gửi được email lúc này. Hãy thử lại sau.' }, 502);
      // Avoid exposing whether an address is registered.
      return json({ message: 'Nếu email đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu.' });
    } catch {
      return json({ error: 'Không kết nối được hệ thống gửi email.' }, 502);
    }
  },
};
