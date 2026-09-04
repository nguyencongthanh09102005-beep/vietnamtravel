import {
  appendCookies,
  getRequestAuthSession,
  getSupabaseConfig,
  supabaseRestFetch,
} from './_lib/supabase';

interface StoredTravelData {
  user_id: string;
  saved_provinces?: string[] | null;
  visited_provinces?: string[] | null;
  ai_chats?: Record<string, unknown[]> | null;
  itineraries?: unknown[] | null;
}

interface UpdateBody {
  savedProvinces?: string[];
  visitedProvinces?: string[];
  aiChats?: Record<string, unknown[]>;
  itineraries?: unknown[];
}

function json(data: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  appendCookies(headers, cookies);
  return Response.json(data, { status, headers });
}

function toClientData(row?: StoredTravelData) {
  return {
    savedProvinces: row?.saved_provinces ?? [],
    visitedProvinces: row?.visited_provinces ?? [],
    aiChats: row?.ai_chats ?? {},
    itineraries: row?.itineraries ?? [],
  };
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return [...new Set(value.filter((item): item is string => typeof item === 'string').map((item) => item.slice(0, 80)))].slice(0, 100);
}

function cleanAiChats(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const result: Record<string, unknown[]> = {};
  for (const [province, messages] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(messages)) continue;
    result[province.slice(0, 80)] = messages.slice(-40);
  }
  return result;
}

export default {
  async fetch(request: Request) {
    if (!['GET', 'PATCH', 'PUT'].includes(request.method)) {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (!getSupabaseConfig().configured) {
      return json({ error: 'Database người dùng chưa được cấu hình.' }, 503);
    }

    const session = await getRequestAuthSession(request);
    if (!session) return json({ error: 'Bạn cần đăng nhập để đồng bộ dữ liệu.' }, 401);

    const encodedUserId = encodeURIComponent(session.user.id);

    if (request.method === 'GET') {
      const response = await supabaseRestFetch(
        `/user_travel_data?select=user_id,saved_provinces,visited_provinces,ai_chats,itineraries&user_id=eq.${encodedUserId}&limit=1`,
        session.accessToken,
        { method: 'GET' },
      );

      if (!response.ok) {
        const detail = await response.text();
        console.error('Read user data failed:', response.status, detail.slice(0, 400));
        return json({ error: 'Không đọc được dữ liệu tài khoản.' }, 502, session.cookies);
      }

      const rows = (await response.json()) as StoredTravelData[];
      return json({ data: toClientData(rows[0]) }, 200, session.cookies);
    }

    let body: UpdateBody;
    try {
      body = (await request.json()) as UpdateBody;
    } catch {
      return json({ error: 'Dữ liệu đồng bộ không hợp lệ.' }, 400, session.cookies);
    }

    if (JSON.stringify(body).length > 300_000) {
      return json({ error: 'Dữ liệu đồng bộ quá lớn.' }, 413, session.cookies);
    }

    const savedProvinces = cleanStringArray(body.savedProvinces);
    const visitedProvinces = cleanStringArray(body.visitedProvinces);
    const aiChats = cleanAiChats(body.aiChats);
    const itineraries = Array.isArray(body.itineraries) ? body.itineraries.slice(-50) : undefined;

    const databaseRow: Record<string, unknown> = {
      user_id: session.user.id,
      updated_at: new Date().toISOString(),
    };
    if (savedProvinces) databaseRow.saved_provinces = savedProvinces;
    if (visitedProvinces) databaseRow.visited_provinces = visitedProvinces;
    if (aiChats) databaseRow.ai_chats = aiChats;
    if (itineraries) databaseRow.itineraries = itineraries;

    const fallbackRow: StoredTravelData = {
      user_id: session.user.id,
      saved_provinces: savedProvinces,
      visited_provinces: visitedProvinces,
      ai_chats: aiChats,
      itineraries,
    };

    const response = await supabaseRestFetch('/user_travel_data?on_conflict=user_id', session.accessToken, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(databaseRow),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Write user data failed:', response.status, detail.slice(0, 400));
      return json({ error: 'Không lưu được dữ liệu tài khoản.' }, 502, session.cookies);
    }

    const rows = (await response.json()) as StoredTravelData[];
    return json({ data: toClientData(rows[0] ?? fallbackRow) }, 200, session.cookies);
  },
};
