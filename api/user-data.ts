import { provincesData } from '../src/data/provincesData.js';
import { dbOne, dbQuery, getRequestAuthSession, json } from './_lib/auth.js';

interface UpdateBody {
  savedProvinces?: unknown;
  visitedProvinces?: unknown;
  aiChats?: unknown;
  itineraries?: unknown;
}
const validProvinceIds = new Set(Object.keys(provincesData));

function parseJson(value: unknown, fallback: unknown) {
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function toClientData(row: Record<string, unknown> | null) {
  return {
    savedProvinces: parseJson(row?.saved_provinces, []),
    visitedProvinces: parseJson(row?.visited_provinces, []),
    aiChats: parseJson(row?.ai_chats, {}),
    itineraries: parseJson(row?.itineraries, []),
  };
}

function cleanProvinceArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && validProvinceIds.has(id)))].slice(0, 36);
}

function cleanItineraries(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item) => item && typeof item === 'object'
      && typeof item.id === 'string' && item.id.length <= 120
      && typeof item.provinceId === 'string' && validProvinceIds.has(item.provinceId)
      && typeof item.title === 'string' && item.title.trim()
      && typeof item.notes === 'string' && item.notes.trim())
    .slice(-50)
    .map((item) => ({
      id: item.id,
      provinceId: item.provinceId,
      title: item.title.trim().slice(0, 120),
      notes: item.notes.trim().slice(0, 12000),
      createdAt: typeof item.createdAt === 'string' ? item.createdAt.slice(0, 40) : new Date().toISOString(),
    }));
}

function safeMapsUrl(value: unknown) {
  if (typeof value !== 'string' || value.length > 1600) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      (url.hostname === 'www.google.com' && url.pathname.startsWith('/maps')) ||
      url.hostname === 'maps.google.com'
    );
  } catch { return false; }
}

function cleanChats(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const result: Record<string, unknown[]> = {};
  for (const [province, rawMessages] of Object.entries(value as Record<string, unknown>)) {
    if (!validProvinceIds.has(province) || !Array.isArray(rawMessages)) continue;
    result[province] = rawMessages.filter((item) => item && typeof item === 'object'
        && typeof item.id === 'string' && typeof item.text === 'string'
        && (item.role === 'user' || item.role === 'assistant'))
      .slice(-40).map((item) => ({
        id: item.id.slice(0, 100),
        role: item.role,
        text: item.text.slice(0, 4000),
        itinerary: item.itinerary === true,
        livePlaces: item.livePlaces === true,
        mapActions: Array.isArray(item.mapActions)
          ? item.mapActions.filter((a: unknown) => a && typeof a === 'object'
            && typeof (a as { label?: unknown }).label === 'string'
            && safeMapsUrl((a as { url?: unknown }).url)).slice(0, 8)
            .map((a: { label: string; url: string }) => ({ label: a.label.slice(0, 100), url: a.url }))
          : [],
        placeCards: Array.isArray(item.placeCards)
          ? item.placeCards.filter((p: unknown) => p && typeof p === 'object'
            && typeof (p as { id?: unknown }).id === 'string'
            && typeof (p as { name?: unknown }).name === 'string'
            && safeMapsUrl((p as { googleMapsUrl?: unknown }).googleMapsUrl)
            && safeMapsUrl((p as { directionsUrl?: unknown }).directionsUrl)).slice(0, 8)
            .map((p: { id: string; name: string; address?: unknown; rating?: unknown; userRatingCount?: unknown; googleMapsUrl: string; directionsUrl: string }) => ({
              id: p.id.slice(0, 120),
              name: p.name.slice(0, 160),
              address: typeof p.address === 'string' ? p.address.slice(0, 300) : undefined,
              rating: typeof p.rating === 'number' && p.rating >= 0 && p.rating <= 5 ? p.rating : undefined,
              userRatingCount: typeof p.userRatingCount === 'number' ? Math.min(1000000, Math.max(0, p.userRatingCount)) : undefined,
              googleMapsUrl: p.googleMapsUrl,
              directionsUrl: p.directionsUrl,
            }))
          : [],
      }));
  }
  return result;
}

export default {
  async fetch(request: Request) {
    if (!['GET', 'PATCH', 'PUT'].includes(request.method)) {
      return json({ error: 'Method not allowed' }, 405);
    }

    try {
      const session = await getRequestAuthSession(request);
      if (!session) return json({ error: 'Bạn cần đăng nhập để sử dụng dữ liệu cá nhân.' }, 401);
      const userId = session.user.id;
      if (request.method === 'GET') {
        const row = await dbOne('SELECT * FROM user_travel_data WHERE user_id=?', [userId]);
        return json({ data: toClientData(row) });
      }

      let body: UpdateBody;
      try { body = await request.json(); }
      catch { return json({ error: 'Dữ liệu đồng bộ không hợp lệ.' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body) || JSON.stringify(body).length > 300_000) {
        return json({ error: 'Dữ liệu đồng bộ quá lớn hoặc không hợp lệ.' }, 413);
      }

      const changes: Array<[string, string]> = [];
      if (body.savedProvinces !== undefined) {
        const clean = cleanProvinceArray(body.savedProvinces);
        if (!clean) return json({ error: 'Danh sách tỉnh yêu thích không hợp lệ.' }, 400);
        changes.push(['saved_provinces', JSON.stringify(clean)]);
      }
      if (body.visitedProvinces !== undefined) {
        const clean = cleanProvinceArray(body.visitedProvinces);
        if (!clean) return json({ error: 'Danh sách tỉnh đã đi không hợp lệ.' }, 400);
        changes.push(['visited_provinces', JSON.stringify(clean)]);
      }
      if (body.aiChats !== undefined) {
        const clean = cleanChats(body.aiChats);
        if (!clean) return json({ error: 'Dữ liệu lịch sử AI không hợp lệ.' }, 400);
        changes.push(['ai_chats', JSON.stringify(clean)]);
      }
      if (body.itineraries !== undefined) {
        const clean = cleanItineraries(body.itineraries);
        if (!clean) return json({ error: 'Dữ liệu lịch trình không hợp lệ.' }, 400);
        changes.push(['itineraries', JSON.stringify(clean)]);
      }

      await dbQuery('INSERT INTO user_travel_data(user_id,updated_at) VALUES(?,?) ON CONFLICT(user_id) DO NOTHING',
        [userId, new Date().toISOString()]);
      if (changes.length) {
        const assignments = changes.map(([field]) => field + '=?').join(',');
        await dbQuery('UPDATE user_travel_data SET ' + assignments + ',updated_at=? WHERE user_id=?',
          [...changes.map(([,value]) => value), new Date().toISOString(), userId]);
      }
      const row = await dbOne('SELECT * FROM user_travel_data WHERE user_id=?', [userId]);
      return json({ data: toClientData(row) });
    } catch (error) {
      console.error('[user-data] error:', error);
      return json({ error: 'Không kết nối được database dữ liệu người dùng.' }, 503);
    }
  },
};
