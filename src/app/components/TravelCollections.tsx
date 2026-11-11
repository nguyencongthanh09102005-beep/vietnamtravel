import { useEffect, useState } from 'react';
import { Bookmark, CheckCircle2, LoaderCircle, MapPin, Pencil, Trash2, X } from 'lucide-react';
import { provincesData, type ProvinceId } from '../../data/provincesData';

export interface TripPlan {
  id: string;
  provinceId: ProvinceId;
  title: string;
  notes: string;
  createdAt: string;
}

interface TravelData {
  savedProvinces: string[];
  visitedProvinces: string[];
  itineraries: TripPlan[];
}

interface Props {
  open: boolean;
  selectedProvince: string;
  onClose: () => void;
  onSelectProvince: (id: string) => void;
  draftItinerary: { provinceId: string; notes: string } | null;
  onDraftConsumed: () => void;
}

const blank: TravelData = { savedProvinces: [], visitedProvinces: [], itineraries: [] };
const provinceIds = Object.keys(provincesData) as ProvinceId[];
const provinceName = (id: string) => provincesData[id as ProvinceId]?.name ?? id;

function parseData(raw: unknown): TravelData {
  const obj = raw && typeof raw === 'object' ? raw as Partial<TravelData> : {};
  const ids = new Set<string>(provinceIds);
  return {
    savedProvinces: Array.isArray(obj.savedProvinces) ? obj.savedProvinces.filter((id) => ids.has(id)) : [],
    visitedProvinces: Array.isArray(obj.visitedProvinces) ? obj.visitedProvinces.filter((id) => ids.has(id)) : [],
    itineraries: Array.isArray(obj.itineraries)
      ? obj.itineraries.filter((item): item is TripPlan => Boolean(item && typeof item.id === 'string' && ids.has(item.provinceId) && typeof item.title === 'string' && typeof item.notes === 'string'))
      : [],
  };
}

export function TravelCollections({ open, selectedProvince, onClose, onSelectProvince, draftItinerary, onDraftConsumed }: Props) {
  const [data, setData] = useState<TravelData>(blank);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [tab, setTab] = useState<'provinces' | 'plans'>('provinces');
  const [picked, setPicked] = useState<ProvinceId>('Ha Noi');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setReady(false);
    setError('');
    void (async () => {
      try {
        const response = await fetch('/api/user-data', { cache: 'no-store' });
        if (!response.ok) throw new Error('Cloud unavailable');
        const payload = (await response.json()) as { data?: unknown };
        if (!active) return;
        setData(parseData(payload.data));
        setReady(true);
      } catch {
        if (active) setError('Không tải được dữ liệu tài khoản. Hãy thử lại trước khi thay đổi.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [open, reload]);

  useEffect(() => {
    if (selectedProvince in provincesData) setPicked(selectedProvince as ProvinceId);
  }, [selectedProvince]);

  useEffect(() => {
    if (!draftItinerary || !(draftItinerary.provinceId in provincesData)) return;
    setPicked(draftItinerary.provinceId as ProvinceId);
    setTitle('Lịch trình ' + provinceName(draftItinerary.provinceId));
    setNotes(draftItinerary.notes);
    setEditId(null);
    setTab('plans');
  }, [draftItinerary]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  async function save(patch: Partial<TravelData>) {
    if (!ready || saving) return false;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/user-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error('Save failed');
      const payload = (await response.json()) as { data?: unknown };
      setData(parseData(payload.data));
      return true;
    } catch {
      setError('Lưu thất bại. Thay đổi chưa được áp dụng; hãy thử lại.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: 'savedProvinces' | 'visitedProvinces') {
    const next = data[key].includes(picked)
      ? data[key].filter((id) => id !== picked)
      : [...data[key], picked];
    void save({ [key]: next });
  }

  async function savePlan() {
    if (!title.trim() || !notes.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung lịch trình.');
      return;
    }
    const existing = data.itineraries.find((item) => item.id === editId);
    const plan: TripPlan = {
      id: existing?.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2)),
      provinceId: picked,
      title: title.trim().slice(0, 120),
      notes: notes.trim().slice(0, 12000),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    const next = existing
      ? data.itineraries.map((item) => item.id === editId ? plan : item)
      : [...data.itineraries, plan];
    if (await save({ itineraries: next.slice(-50) })) {
      setTitle('');
      setNotes('');
      setEditId(null);
      onDraftConsumed();
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/65 p-2 sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="travel-title" className="flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 id="travel-title" className="text-lg font-bold text-gray-900">Hành trình của tôi</h2>
            <p className="text-xs text-gray-500">Tỉnh yêu thích, những nơi đã đi và lịch trình cá nhân</p>
          </div>
          <button type="button" aria-label="Đóng hành trình" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </header>
        <nav aria-label="Mục hành trình" className="flex border-b border-gray-100 px-4">
          <button type="button" aria-pressed={tab === 'provinces'} onClick={() => setTab('provinces')} className={'px-4 py-3 text-sm font-semibold ' + (tab === 'provinces' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500')}>Tỉnh đã lưu / đã đi</button>
          <button type="button" aria-pressed={tab === 'plans'} onClick={() => setTab('plans')} className={'px-4 py-3 text-sm font-semibold ' + (tab === 'plans' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500')}>Lịch trình ({data.itineraries.length})</button>
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? <p className="flex items-center gap-2 text-sm text-gray-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Đang tải dữ liệu...</p> : null}
          {error ? <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error} {!ready ? <button type="button" onClick={() => setReload((n) => n + 1)} className="ml-2 font-bold underline">Thử lại</button> : null}</div> : null}
          {ready && tab === 'provinces' ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4">
                <label htmlFor="travel-province" className="mb-2 block text-sm font-semibold">Chọn tỉnh thành</label>
                <select id="travel-province" value={picked} onChange={(event) => setPicked(event.target.value as ProvinceId)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                  {provinceIds.map((id) => <option key={id} value={id}>{provinceName(id)}</option>)}
                </select>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" disabled={saving} onClick={() => toggle('savedProvinces')} className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-2 py-2.5 text-xs font-semibold text-blue-800 disabled:opacity-50">
                    <Bookmark className="h-4 w-4" /> {data.savedProvinces.includes(picked) ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                  </button>
                  <button type="button" disabled={saving} onClick={() => toggle('visitedProvinces')} className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-2 py-2.5 text-xs font-semibold text-emerald-800 disabled:opacity-50">
                    <CheckCircle2 className="h-4 w-4" /> {data.visitedProvinces.includes(picked) ? 'Bỏ đã đi' : 'Đánh dấu đã đi'}
                  </button>
                </div>
              </div>
              {([['savedProvinces', 'Tỉnh yêu thích'], ['visitedProvinces', 'Những nơi đã đi']] as const).map(([key, label]) => (
                <div key={key}>
                  <h3 className="mb-3 font-bold text-gray-900">{label} ({data[key].length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {data[key].map((id) => <button key={id} type="button" onClick={() => { onSelectProvince(id); onClose(); }} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-2 text-xs text-gray-700 hover:bg-sky-50 hover:text-sky-700"><MapPin className="h-3 w-3" />{provinceName(id)}</button>)}
                  </div>
                  {!data[key].length ? <p className="text-sm text-gray-400">Chưa có tỉnh nào.</p> : null}
                </div>
              ))}
            </div>
          ) : null}
          {ready && tab === 'plans' ? (
            <div className="space-y-6">
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-bold">{editId ? 'Chỉnh sửa lịch trình' : 'Lưu lịch trình mới'}</h3>
                <select aria-label="Tỉnh của lịch trình" value={picked} onChange={(event) => setPicked(event.target.value as ProvinceId)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                  {provinceIds.map((id) => <option key={id} value={id}>{provinceName(id)}</option>)}
                </select>
                <input aria-label="Tên lịch trình" placeholder="Tên lịch trình, ví dụ: Đà Nẵng 2 ngày" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
                <textarea aria-label="Nội dung lịch trình" placeholder="Nhập lịch trình hoặc lưu từ câu trả lời AI..." value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={12000} rows={5} className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button type="button" disabled={saving} onClick={() => void savePlan()} className="rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Lưu lịch trình'}</button>
                  {editId ? <button type="button" onClick={() => { setEditId(null); setTitle(''); setNotes(''); }} className="rounded-lg border border-gray-200 px-3 text-sm">Hủy sửa</button> : null}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Đã lưu ({data.itineraries.length})</h3>
                {data.itineraries.length ? [...data.itineraries].reverse().map((plan) => (
                  <article key={plan.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                        <p className="mt-1 text-xs text-gray-500">{provinceName(plan.provinceId)}</p>
                      </div>
                      <div className="flex shrink-0">
                        <button type="button" aria-label={'Chỉnh sửa ' + plan.title} onClick={() => { setEditId(plan.id); setPicked(plan.provinceId); setTitle(plan.title); setNotes(plan.notes); }} className="rounded-lg p-2 hover:bg-gray-100"><Pencil className="h-4 w-4" /></button>
                        <button type="button" disabled={saving} aria-label={'Xóa ' + plan.title} onClick={() => { if (window.confirm('Xóa lịch trình này?')) void save({ itineraries: data.itineraries.filter((item) => item.id !== plan.id) }); }} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{plan.notes}</p>
                  </article>
                )) : <p className="text-sm text-gray-400">Chưa lưu lịch trình nào.</p>}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
