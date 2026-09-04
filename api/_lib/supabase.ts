const ACCESS_COOKIE = 'vt_access_token';
const REFRESH_COOKIE = 'vt_refresh_token';

interface SupabaseUser {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface SupabaseSessionPayload {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: SupabaseUser;
}

export interface PublicAuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface RequestAuthSession {
  user: PublicAuthUser;
  accessToken: string;
  cookies: string[];
}

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  return {
    configured: Boolean(url && anonKey),
    url,
    anonKey,
  };
}

function parseCookies(request: Request) {
  const header = request.headers.get('cookie') ?? '';
  return new Map(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        const key = index >= 0 ? part.slice(0, index) : part;
        const value = index >= 0 ? part.slice(index + 1) : '';
        return [decodeURIComponent(key), decodeURIComponent(value)] as const;
      }),
  );
}

function serializeCookie(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearAuthCookies() {
  return [
    serializeCookie(ACCESS_COOKIE, '', 0),
    serializeCookie(REFRESH_COOKIE, '', 0),
  ];
}

export function authCookies(session: SupabaseSessionPayload) {
  if (!session.access_token || !session.refresh_token) return [];
  const expiresIn = Math.max(60, session.expires_in ?? 3600);
  return [
    serializeCookie(ACCESS_COOKIE, session.access_token, expiresIn),
    serializeCookie(REFRESH_COOKIE, session.refresh_token, 60 * 60 * 24 * 30),
  ];
}

export function appendCookies(headers: Headers, cookies: string[]) {
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
}

export function toPublicUser(user: SupabaseUser): PublicAuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    displayName: user.user_metadata?.full_name?.trim() || user.email?.split('@')[0] || 'Traveler',
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    createdAt: user.created_at,
  };
}

export async function supabaseAuthFetch(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
) {
  const { configured, url, anonKey } = getSupabaseConfig();
  if (!configured || !url || !anonKey) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const headers = new Headers(init.headers);
  headers.set('apikey', anonKey);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  return fetch(`${url}${path}`, { ...init, headers });
}

async function fetchUser(accessToken: string) {
  const response = await supabaseAuthFetch('/auth/v1/user', { method: 'GET' }, accessToken);
  if (!response.ok) return null;
  return (await response.json()) as SupabaseUser;
}

async function refreshSession(refreshToken: string) {
  const response = await supabaseAuthFetch('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) return null;
  return (await response.json()) as SupabaseSessionPayload;
}

export async function getRequestAuthSession(request: Request): Promise<RequestAuthSession | null> {
  const cookies = parseCookies(request);
  const accessToken = cookies.get(ACCESS_COOKIE) ?? '';
  const refreshToken = cookies.get(REFRESH_COOKIE) ?? '';

  if (accessToken) {
    const user = await fetchUser(accessToken);
    if (user) {
      return { user: toPublicUser(user), accessToken, cookies: [] };
    }
  }

  if (!refreshToken) return null;

  const refreshed = await refreshSession(refreshToken);
  if (!refreshed?.access_token || !refreshed.user) return null;

  return {
    user: toPublicUser(refreshed.user),
    accessToken: refreshed.access_token,
    cookies: authCookies(refreshed),
  };
}

export async function supabaseRestFetch(
  path: string,
  accessToken: string,
  init: RequestInit = {},
) {
  const { configured, url, anonKey } = getSupabaseConfig();
  if (!configured || !url || !anonKey) throw new Error('SUPABASE_NOT_CONFIGURED');

  const headers = new Headers(init.headers);
  headers.set('apikey', anonKey);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');

  return fetch(`${url}/rest/v1${path}`, { ...init, headers });
}
