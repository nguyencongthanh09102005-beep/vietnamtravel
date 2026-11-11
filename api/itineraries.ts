import { dbOne, dbQuery, getRequestAuthSession, json, makeId } from './_lib/auth.js';
import { validateStoredPlan, type SavedItinerary } from '../src/utils/itinerary.js';

function readSaved(row: Record<string, unknown>): SavedItinerary | null {
  try {
    const plan = validateStoredPlan(JSON.parse(String(row.plan_json)));
    if (!plan) return null;
    return {
      id: String(row.id),
      revision: Number(row.revision),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      plan,
    };
  } catch { return null; }
}
const selectedColumns = 'id,province_id,title,days,party_size,budget_vnd,travel_style,plan_json,revision,created_at,updated_at';

export default {
  async fetch(request: Request) {
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(request.method)) {
      return json({ error: 'Method not allowed' }, 405);
    }
    try {
      const session = await getRequestAuthSession(request);
      if (!session) return json({ error: 'Cần đăng nhập để lưu và quản lý lịch trình.' }, 401);
      const userId = session.user.id;

      if (request.method === 'GET') {
        const rows = await dbQuery(
          'SELECT ' + selectedColumns + ' FROM travel_plans WHERE user_id=? ORDER BY updated_at DESC LIMIT 50',
          [userId],
        );
        return json({ items: rows.rows.map(readSaved).filter((item): item is SavedItinerary => item !== null) });
      }

      if (request.method === 'DELETE') {
        const id = new URL(request.url).searchParams.get('id') ?? '';
        if (!/^[a-f0-9-]{36}$/.test(id)) return json({ error: 'ID lịch trình không hợp lệ.' }, 400);
        const result = await dbQuery('DELETE FROM travel_plans WHERE id=? AND user_id=?', [id, userId]);
        if (!result.changes) return json({ error: 'Không tìm thấy lịch trình.' }, 404);
        return json({ ok: true });
      }

      let body: unknown;
      try { body = await request.json(); }
      catch { return json({ error: 'Dữ liệu lịch trình không hợp lệ.' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body) ||
        JSON.stringify(body).length > 150_000) return json({ error: 'Dữ liệu lịch trình quá lớn.' }, 413);
      const obj = body as Record<string, unknown>;
      const plan = validateStoredPlan(obj.plan);
      if (!plan) return json({ error: 'Lịch trình không đạt kiểm tra cấu trúc hoặc ngân sách.' }, 400);
      const timestamp = new Date().toISOString();

      if (request.method === 'POST') {
        const count = await dbOne('SELECT COUNT(*) AS count FROM travel_plans WHERE user_id=?', [userId]);
        if (Number(count?.count ?? 0) >= 50) return json({ error: 'Tối đa 50 lịch trình. Hãy xóa bớt lịch trình cũ.' }, 409);
        const id = makeId();
        await dbQuery(
          'INSERT INTO travel_plans(id,user_id,province_id,title,days,party_size,budget_vnd,travel_style,plan_json,revision,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,1,?,?)',
          [id, userId, plan.provinceId, plan.title, plan.days, plan.partySize,
            plan.totalBudgetVnd, plan.style, JSON.stringify(plan), timestamp, timestamp],
        );
        return json({ item: { id, revision: 1, createdAt: timestamp, updatedAt: timestamp, plan } }, 201);
      }

      const id = typeof obj.id === 'string' ? obj.id : '';
      const revision = obj.revision;
      if (!/^[a-f0-9-]{36}$/.test(id) || !Number.isSafeInteger(revision) || (revision as number) < 1) {
        return json({ error: 'ID hoặc phiên bản cập nhật không hợp lệ.' }, 400);
      }
      const result = await dbQuery(
        'UPDATE travel_plans SET province_id=?,title=?,days=?,party_size=?,budget_vnd=?,travel_style=?,plan_json=?,revision=revision+1,updated_at=? WHERE id=? AND user_id=? AND revision=?',
        [plan.provinceId, plan.title, plan.days, plan.partySize, plan.totalBudgetVnd,
          plan.style, JSON.stringify(plan), timestamp, id, userId, revision as number],
      );
      if (!result.changes) {
        const exists = await dbOne('SELECT revision FROM travel_plans WHERE id=? AND user_id=?', [id, userId]);
        return json({ error: exists ? 'Lịch trình đã được sửa ở nơi khác. Tải lại trước khi lưu.' : 'Không tìm thấy lịch trình.' }, exists ? 409 : 404);
      }
      return json({ item: { id, revision: (revision as number) + 1, createdAt: '',
        updatedAt: timestamp, plan } });
    } catch (error) {
      console.error('[itineraries] database error:', error);
      return json({ error: 'Không truy cập được database lịch trình.' }, 503);
    }
  },
};
