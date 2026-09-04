import {
  appendCookies,
  authCookies,
  getSupabaseConfig,
  supabaseAuthFetch,
  toPublicUser,
} from '../_lib/supabase';

interface RegisterBody {
  email?: string;
  password?: string;
  displayName?: string;
}

interface RegisterPayload {
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

    if (!getSupabaseConfig().configured) {
      return json({ error: 'Hệ thống tài khoản chưa được kết nối database trên Vercel.' }, 503);
    }

    let body: RegisterBody;
    try {
      body = (await request.json()) as RegisterBody;
    } catch {
      return json({ error: 'Dữ liệu đăng ký không hợp lệ.' }, 400);
    }

    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';
    const displayName = body.displayName?.trim() ?? '';

    if (!email || !password || displayName.length < 2) {
      return json({ error: 'Hãy nhập đủ tên, email và mật khẩu.' }, 400);
    }
    if (password.length < 8) {
      return json({ error: 'Mật khẩu cần ít nhất 8 ký tự.' }, 400);
    }

    const response = await supabaseAuthFetch('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        data: { full_name: displayName },
      }),
    });
    const payload = (await response.json()) as RegisterPayload;

    if (!response.ok || !payload.user) {
      return json(
        { error: payload.error_description || payload.msg || 'Không thể tạo tài khoản.' },
        response.status >= 400 ? response.status : 400,
      );
    }

    if (payload.access_token && payload.refresh_token) {
      return json(
        { user: toPublicUser(payload.user), needsEmailConfirmation: false },
        200,
        authCookies(payload),
      );
    }

    return json({ user: null, needsEmailConfirmation: true });
  },
};
