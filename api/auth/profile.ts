import {
  appendCookies,
  getRequestAuthSession,
  getSupabaseConfig,
  supabaseAuthFetch,
  supabaseRestFetch,
  toPublicUser,
} from '../_lib/supabase.js';

function json(data: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  appendCookies(headers, cookies);
  return Response.json(data, { status, headers });
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'PATCH') return json({ error: 'Method not allowed' }, 405);
    if (!getSupabaseConfig().configured) return json({ error: 'Tài khoản chưa được cấu hình.' }, 503);

    const session = await getRequestAuthSession(request);
    if (!session) return json({ error: 'Bạn cần đăng nhập để cập nhật hồ sơ.' }, 401);

    let body: { displayName?: string; avatarUrl?: string };
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu hồ sơ không hợp lệ.' }, 400, session.cookies); }

    const displayName = typeof body?.displayName === 'string' ? body.displayName.trim() : '';
    const avatarUrl = typeof body?.avatarUrl === 'string' ? body.avatarUrl.trim() : '';
    if (displayName.length < 2 || displayName.length > 80 || avatarUrl.length > 500) {
      return json({ error: 'Tên phải từ 2–80 ký tự, đường dẫn ảnh tối đa 500 ký tự.' }, 400, session.cookies);
    }
    if (avatarUrl) {
      try {
        const url = new URL(avatarUrl);
        if (url.protocol !== 'https:') throw new Error('Invalid URL');
      } catch {
        return json({ error: 'Đường dẫn ảnh đại diện phải bắt đầu bằng https://.' }, 400, session.cookies);
      }
    }

    try {
      const response = await supabaseAuthFetch('/auth/v1/user', {
        method: 'PUT',
        body: JSON.stringify({
          data: { full_name: displayName, avatar_url: avatarUrl || null },
        }),
      }, session.accessToken);
      if (!response.ok) return json({ error: 'Không cập nhật được hồ sơ.' }, 502, session.cookies);
      const updated = await response.json();
      // Keep the profile table aligned with Supabase Auth metadata, when available.
      try {
        const updateProfile = await supabaseRestFetch(
          '/profiles?id=eq.' + encodeURIComponent(session.user.id),
          session.accessToken,
          {
            method: 'PATCH',
            body: JSON.stringify({ display_name: displayName, avatar_url: avatarUrl || null, updated_at: new Date().toISOString() }),
          },
        );
        if (!updateProfile.ok) console.warn('Profile row sync returned', updateProfile.status);
      } catch (error) {
        console.warn('Unable to synchronize profile row', error);
      }
      return json({ user: toPublicUser(updated) }, 200, session.cookies);
    } catch {
      return json({ error: 'Không kết nối được máy chủ.' }, 502, session.cookies);
    }
  },
};
