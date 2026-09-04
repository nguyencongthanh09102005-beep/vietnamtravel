import {
  appendCookies,
  authCookies,
  getSupabaseConfig,
  supabaseAuthFetch,
  toPublicUser,
} from '../_lib/supabase';

interface LoginBody {
  email?: string;
  password?: string;
}

interface LoginPayload {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
    created_at?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  };
  error_description?: string;
  msg?: string;
}

function json(data: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  appendCookies(headers, cookies);
  return Response.json(data, { status, headers });
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const config = getSupabaseConfig();
    if (!config.configured) {
      return json({ error: 'Hệ thống tài khoản chưa được kết nối database trên Vercel.' }, 503);
    }

    let body: LoginBody;
    try {
      body = (await request.json()) as LoginBody;
    } catch {
      return json({ error: 'Dữ liệu đăng nhập không hợp lệ.' }, 400);
    }

    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';
    if (!email || !password) return json({ error: 'Hãy nhập email và mật khẩu.' }, 400);

    const response = await supabaseAuthFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json()) as LoginPayload;

    if (!response.ok || !payload.user || !payload.access_token || !payload.refresh_token) {
      const message = payload.error_description || payload.msg || 'Email hoặc mật khẩu chưa đúng.';
      return json({ error: message }, response.status >= 400 ? response.status : 401);
    }

    return json(
      { user: toPublicUser(payload.user) },
      200,
      authCookies(payload),
    );
  },
};
