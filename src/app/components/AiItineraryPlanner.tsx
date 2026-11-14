import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowRight, BookmarkCheck, CalendarDays, Check, ChevronRight,
  CircleDollarSign, LoaderCircle, MapPinned, Pencil, Plus, RefreshCw,
  Sparkles, Trash2, WandSparkles, X,
} from 'lucide-react';
import { provincesData, type ProvinceId } from '../../data/provincesData';
import { ItineraryDayMap } from './ItineraryDayMap';
import {
  recalculatePlan,
  type ItineraryDay,
  type ItineraryRequest,
  type ItineraryStop,
  type SavedItinerary,
  type StructuredItinerary,
  type TravelStyle,
} from '../../utils/itinerary';

interface Props {
  open: boolean;
  provinceId: string;
  authenticated: boolean;
  requestedSavedPlan: SavedItinerary | null;
  onClose: () => void;
}

const STYLE_CHOICES: { id: TravelStyle; title: string }[] = [
  { id: 'food', title: '🍜 Ẩm thực' },
  { id: 'nature', title: '🌿 Thiên nhiên' },
  { id: 'relax', title: '🏖️ Nghỉ dưỡng' },
  { id: 'culture', title: '🏛️ Văn hóa' },
  { id: 'explore', title: '🎒 Khám phá' },
];
const PERIODS = [
  { id: 'morning', label: 'Sáng' },
  { id: 'noon', label: 'Trưa' },
  { id: 'afternoon', label: 'Chiều' },
  { id: 'evening', label: 'Tối' },
] as const;
const CATEGORIES = [
  { id: 'food', label: 'Ăn uống' },
  { id: 'activities', label: 'Hoạt động' },
  { id: 'transport', label: 'Di chuyển' },
  { id: 'lodging', label: 'Lưu trú' },
] as const;
const price = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';
function baseRequest(id: string): ItineraryRequest {
  return {
    provinceId: id in provincesData ? id as ProvinceId : 'Da Nang',
    days: 3,
    partySize: 2,
    totalBudgetVnd: 3_000_000,
    style: 'food',
    startDate: null,
    includeArrivalTransport: false,
    arrivalTransportVnd: 0,
    preferences: { preferAffordablePlaces: true, minimizeTravel: true, notes: '' },
  };
}

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-xs font-semibold text-slate-700">{children}</span>;
}

export function AiItineraryPlanner({ open, provinceId, authenticated, requestedSavedPlan, onClose }: Props) {
  const dialog = useRef<HTMLElement>(null);
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);
  const closeRef = useRef(onClose);
  const requestAbort = useRef<AbortController | null>(null);
  const [form, setForm] = useState<ItineraryRequest>(() => baseRequest(provinceId));
  const [plan, setPlan] = useState<StructuredItinerary | null>(null);
  const [saved, setSaved] = useState<SavedItinerary[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [revision, setRevision] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [listLoading, setListLoading] = useState(false);
  dirtyRef.current = dirty;
  busyRef.current = busy;
  closeRef.current = onClose;

  useEffect(() => {
    if (provinceId in provincesData && !plan) {
      setForm(old => ({ ...old, provinceId: provinceId as ProvinceId }));
    }
  }, [provinceId, plan]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!busyRef.current && (!dirtyRef.current || window.confirm('Bạn có thay đổi chưa lưu. Đóng mà không lưu?'))) {
          requestAbort.current?.abort();
          closeRef.current();
        }
      }
      if (event.key !== 'Tab') return;
      const controls = [...(dialog.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      ) ?? [])];
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault();
        controls[controls.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
        event.preventDefault();
        controls[0].focus();
      }
    };
    document.addEventListener('keydown', onKeyboard);
    return () => {
      document.removeEventListener('keydown', onKeyboard);
      previous?.focus();
      requestAbort.current?.abort();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !authenticated) return;
    void refreshSaved();
  }, [open, authenticated]);

  useEffect(() => {
    if (!open || !authenticated || !requestedSavedPlan) return;
    // Opening from "Hành trình của tôi" should land on this exact saved plan.
    // The list in the planner continues to refresh through /api/itineraries.
    if (dirtyRef.current && !window.confirm('Bỏ thay đổi chưa lưu để mở lịch trình khác?')) return;
    setPlan(recalculatePlan(requestedSavedPlan.plan));
    setForm({ ...requestedSavedPlan.plan });
    setSavedId(requestedSavedPlan.id);
    setRevision(requestedSavedPlan.revision);
    setSelectedDay(1);
    setEditingStop(null);
    setDirty(false);
    setError('');
    setNotice('Đang xem lịch trình AI đã lưu.');
  }, [open, authenticated, requestedSavedPlan]);

  async function refreshSaved() {
    setListLoading(true);
    try {
      const res = await fetch('/api/itineraries', { cache: 'no-store' });
      const payload = await res.json() as { items?: SavedItinerary[]; error?: string };
      if (!res.ok) throw new Error(payload.error || 'Không tải được lịch trình đã lưu.');
      setSaved(payload.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được lịch trình.');
    } finally {
      setListLoading(false);
    }
  }

  function close() {
    if (dirty && !window.confirm('Bạn có thay đổi chưa lưu. Đóng mà không lưu?')) return;
    requestAbort.current?.abort();
    onClose();
  }

  function updateForm(patch: Partial<ItineraryRequest>) {
    setForm(current => ({ ...current, ...patch }));
  }

  function updatePreferences(patch: Partial<ItineraryRequest['preferences']>) {
    setForm(current => ({ ...current, preferences: { ...current.preferences, ...patch } }));
  }

  async function generate(regenerateDay?: number) {
    if (busy) return;
    if (!regenerateDay && dirty && !window.confirm('Tạo lịch trình mới sẽ thay bản nháp chưa lưu. Tiếp tục?')) return;
    setError('');
    setNotice('');
    setBusy(true);
    const controller = new AbortController();
    requestAbort.current = controller;
    try {
      const body = regenerateDay && plan
        ? { ...form, ...{
          provinceId: plan.provinceId, days: plan.days, partySize: plan.partySize,
          totalBudgetVnd: plan.totalBudgetVnd, style: plan.style, startDate: plan.startDate,
          includeArrivalTransport: plan.includeArrivalTransport, arrivalTransportVnd: plan.arrivalTransportVnd,
          preferences: plan.preferences,
        }, regenerateDay, currentPlan: plan }
        : form;
      const response = await fetch('/api/itineraries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const payload = await response.json() as { plan?: StructuredItinerary; error?: string };
      if (!response.ok || !payload.plan) throw new Error(payload.error || 'Không tạo được lịch trình.');
      setPlan(recalculatePlan(payload.plan));
      setSelectedDay(regenerateDay ?? 1);
      setEditingStop(null);
      setDirty(true);
      if (!regenerateDay) { setSavedId(null); setRevision(1); }
      setNotice(regenerateDay ? 'Đã thay thế riêng Ngày ' + regenerateDay + '.' : 'Đã tạo bản nháp. Hãy kiểm tra giá và địa điểm trước khi lưu.');
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Không tạo được lịch trình.');
      }
    } finally {
      setBusy(false);
      requestAbort.current = null;
    }
  }

  function changePlan(update: (current: StructuredItinerary) => StructuredItinerary) {
    setPlan(current => current ? recalculatePlan(update(current)) : null);
    setDirty(true);
    setNotice('');
  }

  function changeStop(dayNumber: number, stopId: string, patch: Partial<ItineraryStop>) {
    changePlan(current => ({
      ...current,
      schedule: current.schedule.map(day => day.day === dayNumber
        ? { ...day, stops: day.stops.map(stop => stop.id === stopId ? { ...stop, ...patch } : stop) }
        : day),
    }));
  }

  function removeStop(dayNumber: number, stopId: string) {
    const day = plan?.schedule.find(item => item.day === dayNumber);
    if (!day || day.stops.length <= 1) {
      setError('Mỗi ngày cần ít nhất một hoạt động.');
      return;
    }
    changePlan(current => ({
      ...current,
      schedule: current.schedule.map(item => item.day === dayNumber
        ? { ...item, stops: item.stops.filter(stop => stop.id !== stopId) }
        : item),
    }));
  }

  function addStop(dayNumber: number) {
    const day = plan?.schedule.find(item => item.day === dayNumber);
    if (!day || day.stops.length >= 12) { setError('Tối đa 12 hoạt động mỗi ngày.'); return; }
    const id = 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
    const stop: ItineraryStop = {
      id, period: 'afternoon', startTime: '15:00', title: 'Hoạt động mới',
      description: 'Tự chỉnh sửa thông tin hoạt động', estimatedCostVnd: 0,
      category: 'activities', source: 'ai_suggestion', mapUrl: null,
    };
    changePlan(current => ({
      ...current,
      schedule: current.schedule.map(item => item.day === dayNumber
        ? { ...item, stops: [...item.stops, stop] } : item),
    }));
    setEditingStop(id);
    setEditorExpanded(true);
  }

  async function savePlan() {
    if (!plan || !authenticated || busySave) return;
    setBusySave(true);
    setError('');
    try {
      const response = await fetch('/api/itineraries', {
        method: savedId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedId
          ? { id: savedId, revision, plan }
          : { plan }),
      });
      const data = await response.json() as { item?: SavedItinerary; error?: string };
      if (!response.ok || !data.item) throw new Error(data.error || 'Không lưu được lịch trình.');
      setSavedId(data.item.id);
      setRevision(data.item.revision);
      setPlan(data.item.plan);
      setDirty(false);
      setNotice('Đã lưu lịch trình vào tài khoản.');
      await refreshSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu lịch trình.');
    } finally { setBusySave(false); }
  }

  function openSaved(item: SavedItinerary) {
    if (dirty && !window.confirm('Bỏ thay đổi chưa lưu để mở lịch trình khác?')) return;
    setPlan(recalculatePlan(item.plan));
    setForm({ ...item.plan });
    setSavedId(item.id);
    setRevision(item.revision);
    setSelectedDay(1);
    setEditingStop(null);
    setDirty(false);
    setError('');
    setNotice('Đang xem lịch trình đã lưu.');
  }

  async function deleteSaved(item: SavedItinerary) {
    if (!window.confirm('Xóa vĩnh viễn lịch trình "' + item.plan.title + '"?')) return;
    setError('');
    try {
      const response = await fetch('/api/itineraries?id=' + encodeURIComponent(item.id), { method: 'DELETE' });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Không xóa được.');
      setSaved(old => old.filter(entry => entry.id !== item.id));
      if (savedId === item.id) {
        setPlan(null); setSavedId(null); setDirty(false); setRevision(1);
      }
      setNotice('Đã xóa lịch trình.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được.');
    }
  }

  if (!open) return null;
  const currentDay: ItineraryDay | undefined = plan?.schedule.find(day => day.day === selectedDay);
  const dailyTotal = currentDay?.stops.reduce((sum, stop) => sum + stop.estimatedCostVnd, 0) ?? 0;
  const budgetOver = (plan?.budgetRemainingVnd ?? 0) < 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/75 p-0 sm:p-3">
      <section ref={dialog} role="dialog" aria-modal="true" tabIndex={-1}
        aria-labelledby="planner-title"
        className="flex h-full max-h-[100dvh] w-full max-w-7xl flex-col overflow-hidden bg-white shadow-2xl outline-none sm:max-h-[94dvh] sm:rounded-3xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> VIETNAMTRAVEL AI
            </p>
            <h2 id="planner-title" className="truncate text-lg font-bold text-slate-950 sm:text-2xl">Lập lịch trình thông minh</h2>
          </div>
          <button type="button" onClick={close} aria-label="Đóng AI Planner"
            className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-5 p-4 lg:grid-cols-[285px_minmax(0,1fr)] lg:gap-6 lg:p-6">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900"><CalendarDays className="h-4 w-4"/> Thông tin chuyến đi</h3>
                <div className="space-y-3">
                  <label className="block">
                    <Label>Điểm đến</Label>
                    <select value={form.provinceId} onChange={event => updateForm({ provinceId: event.target.value as ProvinceId })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                      {Object.entries(provincesData).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block"><Label>Số ngày</Label>
                      <input type="number" min="1" max="14" value={form.days}
                        onChange={event => updateForm({ days: Number(event.target.value) })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"/>
                    </label>
                    <label className="block"><Label>Số người</Label>
                      <input type="number" min="1" max="20" value={form.partySize}
                        onChange={event => updateForm({ partySize: Number(event.target.value) })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"/>
                    </label>
                  </div>
                  <label className="block"><Label>Ngân sách tổng (VND)</Label>
                    <input type="number" min="200000" max="100000000" step="50000" value={form.totalBudgetVnd}
                      onChange={event => updateForm({ totalBudgetVnd: Number(event.target.value) })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"/>
                  </label>
                  <label className="block"><Label>Ngày bắt đầu (tùy chọn)</Label>
                    <input type="date" value={form.startDate ?? ''}
                      onChange={event => updateForm({ startDate: event.target.value || null })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"/>
                  </label>
                  <div><Label>Phong cách</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLE_CHOICES.map(style => <button key={style.id} type="button"
                        aria-pressed={form.style === style.id}
                        onClick={() => updateForm({ style: style.id })}
                        className={'rounded-xl border px-2 py-2 text-left text-xs font-semibold transition ' +
                          (form.style === style.id ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400')}>
                        {style.title}
                      </button>)}
                    </div>
                  </div>
                  <label className="flex items-start gap-2 text-xs text-slate-700">
                    <input type="checkbox" checked={form.preferences.preferAffordablePlaces}
                      onChange={event => updatePreferences({ preferAffordablePlaces: event.target.checked })}
                      className="mt-0.5 accent-emerald-600"/>
                    Ưu tiên mức giá dễ tiếp cận
                  </label>
                  <label className="flex items-start gap-2 text-xs text-slate-700">
                    <input type="checkbox" checked={form.preferences.minimizeTravel}
                      onChange={event => updatePreferences({ minimizeTravel: event.target.checked })}
                      className="mt-0.5 accent-emerald-600"/>
                    Hạn chế di chuyển xa
                  </label>
                  <label className="flex items-start gap-2 text-xs text-slate-700">
                    <input type="checkbox" checked={form.includeArrivalTransport}
                      onChange={event => updateForm({ includeArrivalTransport: event.target.checked })}
                      className="mt-0.5 accent-emerald-600"/>
                    Tính cả vé đến và rời điểm du lịch
                  </label>
                  {form.includeArrivalTransport ? (
                    <label className="block"><Label>Dự toán vé đến/đi cho cả nhóm (VND)</Label>
                      <input type="number" min="1" max={Math.max(1, form.totalBudgetVnd - 200000)}
                        step="50000" value={form.arrivalTransportVnd}
                        onChange={event => updateForm({ arrivalTransportVnd: Number(event.target.value) })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"/>
                      <span className="mt-1 block text-[11px] text-amber-700">Nhập dự toán của bạn; AI không tự xác minh giá vé. Khoản này sẽ được trừ khỏi ngân sách dành cho các hoạt động.</span>
                    </label>
                  ) : null}
                  <label className="block"><Label>Yêu cầu riêng</Label>
                    <textarea rows={2} maxLength={500} value={form.preferences.notes}
                      onChange={event => updatePreferences({ notes: event.target.value })}
                      placeholder="Ví dụ: ít đi bộ, ưu tiên ăn đặc sản..."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"/>
                  </label>
                  <button type="button" disabled={busy || form.days < 1 || form.days > 14 || form.partySize < 1 || form.partySize > 20 || form.totalBudgetVnd < 200000 || (form.includeArrivalTransport && (form.arrivalTransportVnd <= 0 || form.arrivalTransportVnd > form.totalBudgetVnd - 200000))}
                    onClick={() => void generate()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">
                    {busy ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <WandSparkles className="h-4 w-4"/>}
                    {busy ? 'Đang tạo lịch trình...' : 'Tạo lịch trình bằng AI'}
                  </button>
                  {busy ? <button type="button" onClick={() => requestAbort.current?.abort()}
                    className="w-full text-center text-xs font-semibold text-rose-700 underline">Hủy yêu cầu AI</button> : null}
                  <p className="text-[11px] leading-4 text-slate-500">Lưu trú, di chuyển và quỹ dự phòng được tính trong ngân sách. Giá chỉ là ước tính, không phải báo giá trực tiếp.</p>
                </div>
              </div>

              {authenticated ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Lịch trình đã lưu ({saved.length})</h3>
                    <button type="button" onClick={() => void refreshSaved()} aria-label="Tải lại lịch trình đã lưu"
                      className="p-1 text-slate-500 hover:text-slate-900"><RefreshCw className="h-4 w-4"/></button>
                  </div>
                  {listLoading ? <p className="text-xs text-slate-500">Đang tải...</p> : null}
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {saved.map(item => <div key={item.id} className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2">
                      <button type="button" onClick={() => openSaved(item)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-xs font-semibold text-slate-900">{item.plan.title}</span>
                        <span className="text-[11px] text-slate-500">{item.plan.days} ngày · {provincesData[item.plan.provinceId].name}</span>
                      </button>
                      <button type="button" aria-label={'Xóa ' + item.plan.title}
                        onClick={() => void deleteSaved(item)} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-3.5 w-3.5"/>
                      </button>
                    </div>)}
                    {!saved.length && !listLoading ? <p className="text-xs text-slate-400">Chưa có lịch trình AI đã lưu.</p> : null}
                  </div>
                </section>
              ) : <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Đang ở chế độ khách: bạn có thể tạo và xem bản nháp. Đăng nhập để lưu lịch trình qua nhiều lần mở web.</p>}
            </aside>

            <div className="min-w-0 space-y-4">
              {error ? <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/>{error}</div> : null}
              {notice ? <div role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                <Check className="mt-0.5 h-4 w-4 shrink-0"/>{notice}</div> : null}

              {!plan && !busy ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-sky-50 to-emerald-50 p-8 text-center">
                  <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm"><MapPinned className="h-10 w-10 text-emerald-600"/></div>
                  <h3 className="text-xl font-bold text-slate-900">Hành trình của bạn bắt đầu từ đây</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Chọn thời gian, ngân sách và phong cách bên trái. AI sẽ đề xuất lịch trình theo ngày; bạn có thể thay đổi hoạt động trước khi lưu.
                  </p>
                  <p className="mt-4 text-xs text-slate-500">Ví dụ: Đà Nẵng · 3 ngày · 2 người · 3.000.000đ · Ẩm thực</p>
                </div>
              ) : null}

              {busy ? <div className="space-y-4" aria-live="polite">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700"><LoaderCircle className="h-4 w-4 animate-spin"/> AI đang phân tích sở thích và đề xuất lịch trình...</p>
                  {[1,2,3].map(n => <div key={n} className="mt-3 h-14 animate-pulse rounded-xl bg-slate-200/70"/>)}
                </div>
              </div> : null}

              {plan ? <>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <label htmlFor="ai-trip-title" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-emerald-700">VIETNAMTRAVEL / AI PLANNER · {savedId ? 'BẢN LƯU' : 'BẢN NHÁP'}</label>
                      <input id="ai-trip-title" value={plan.title} maxLength={160}
                        onChange={event => changePlan(p => ({ ...p, title: event.target.value }))}
                        className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-lg font-extrabold text-slate-950 outline-none focus:border-slate-300 sm:text-xl" />
                      <p className="mt-1 text-xs text-slate-500">{plan.days} ngày · {plan.partySize} người · {provincesData[plan.provinceId].name} · {STYLE_CHOICES.find(style => style.id === plan.style)?.title}</p>
                    </div>
                    <button disabled={!authenticated || busySave} type="button" onClick={() => void savePlan()}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
                      {busySave ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <BookmarkCheck className="h-4 w-4"/>}
                      {savedId ? 'Cập nhật bản lưu' : 'Lưu lịch trình'}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">Ngân sách dự kiến</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{price(plan.totalBudgetVnd)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">Điểm dừng hôm nay</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{currentDay?.stops.length ?? 0} điểm</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] text-slate-500">Khoảng cách thực tế</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">Xem Google Maps</p>
                    </div>
                  </div>
                  <p className={'mt-3 text-xs font-semibold ' + (budgetOver ? 'text-rose-700' : 'text-emerald-700')}>
                    Dự toán cả nhóm: {price(plan.estimatedSpendVnd)} · {budgetOver ? 'Vượt ngân sách: ' : 'Còn lại: '}
                    {price(Math.abs(plan.budgetRemainingVnd))}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 sm:grid-cols-3">
                    <span>🍜 Ăn uống: {price(plan.budgetBreakdown.foodVnd)}</span>
                    <span>🏡 Lưu trú: {price(plan.budgetBreakdown.lodgingVnd)}</span>
                    <span>🚕 Di chuyển: {price(plan.budgetBreakdown.transportVnd)}</span>
                    <span>🎟️ Tham quan: {price(plan.budgetBreakdown.activitiesVnd)}</span>
                    <span>💰 Dự phòng: {price(plan.budgetBreakdown.reserveVnd)}</span>
                  </div>
                  {plan.warnings.length ? <ul className="mt-3 space-y-1 text-xs text-amber-800">
                    {plan.warnings.map((warning, index) => <li key={index}>• {warning}</li>)}
                  </ul> : null}
                  <p className="mt-3 text-[11px] text-slate-500">Dự toán cho cả nhóm, không phải giá thực tế. Tuyến đường và thời gian di chuyển thực tế được kiểm tra trên Google Maps.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <nav aria-label="Chọn ngày trong lịch trình" className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {plan.schedule.map(day => <button key={day.day} type="button" onClick={() => { setSelectedDay(day.day); setEditorExpanded(false); setEditingStop(null); }}
                      aria-pressed={selectedDay === day.day}
                      className={'shrink-0 rounded-full px-4 py-2 text-xs font-bold ' +
                        (selectedDay === day.day ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                      Ngày {day.day}
                    </button>)}
                  </nav>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-950">Ngày {selectedDay}</h3>
                      <p className="text-xs text-slate-500">Chi phí hoạt động ngày này: {price(dailyTotal)}</p>
                    </div>
                    <button type="button" disabled={busy} onClick={() => void generate(selectedDay)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                      <RefreshCw className="h-3.5 w-3.5"/> Tạo lại ngày này
                    </button>
                  </div>
                  {currentDay ? (
                    <div className="mb-4">
                      <ItineraryDayMap
                        key={plan.provinceId + ':' + selectedDay}
                        provinceId={plan.provinceId}
                        provinceName={provincesData[plan.provinceId].name}
                        stops={currentDay.stops}
                        onEditStop={stopId => { setEditingStop(stopId); setEditorExpanded(true); }}
                      />
                    </div>
                  ) : null}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <button type="button" aria-expanded={editorExpanded} onClick={() => setEditorExpanded(value => !value)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-100">
                      Chỉnh sửa các hoạt động ngày {selectedDay}
                      <Pencil className="h-4 w-4" aria-hidden="true"/>
                    </button>
                    {editorExpanded ? <div className="mt-3 space-y-3">
                    {currentDay?.stops.map(stop => (
                      <article key={stop.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
                        {editingStop === stop.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <label><Label>Buổi</Label>
                                <select value={stop.period} onChange={event => changeStop(selectedDay, stop.id, { period: event.target.value as ItineraryStop['period'] })}
                                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm">
                                  {PERIODS.map(period => <option key={period.id} value={period.id}>{period.label}</option>)}
                                </select>
                              </label>
                              <label><Label>Giờ dự kiến</Label>
                                <input type="time" value={stop.startTime}
                                  onChange={event => changeStop(selectedDay, stop.id, { startTime: event.target.value })}
                                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"/>
                              </label>
                            </div>
                            <label className="block"><Label>Hoạt động / món ăn</Label>
                              <input maxLength={160} value={stop.title}
                                onChange={event => changeStop(selectedDay, stop.id, { title: event.target.value, mapUrl: null, source: 'ai_suggestion' })}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"/>
                            </label>
                            <label className="block"><Label>Ghi chú</Label>
                              <textarea maxLength={700} rows={2} value={stop.description}
                                onChange={event => changeStop(selectedDay, stop.id, { description: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"/>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <label><Label>Chi phí cả nhóm (VND)</Label>
                                <input type="number" min="0" max="1000000000" step="10000" value={stop.estimatedCostVnd}
                                  onChange={event => changeStop(selectedDay, stop.id, { estimatedCostVnd: Math.max(0, Number(event.target.value)) })}
                                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"/>
                              </label>
                              <label><Label>Danh mục</Label>
                                <select value={stop.category} onChange={event => changeStop(selectedDay, stop.id, { category: event.target.value as ItineraryStop['category'] })}
                                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm">
                                  {CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
                                </select>
                              </label>
                            </div>
                            <button type="button" onClick={() => setEditingStop(null)}
                              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white">Xong chỉnh sửa</button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                                {PERIODS.find(p => p.id === stop.period)?.label ?? ''} · {stop.startTime}
                              </p>
                              <h4 className="mt-1 break-words text-sm font-bold text-slate-900">{stop.title}</h4>
                              <p className="mt-1 text-xs leading-5 text-slate-600">{stop.description}</p>
                              <p className="mt-2 text-xs font-semibold text-slate-700">Dự kiến: {price(stop.estimatedCostVnd)}</p>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                {stop.mapUrl ? <a href={stop.mapUrl} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline">
                                  Tìm trên Google Maps <ChevronRight className="h-3 w-3"/>
                                </a> : null}
                                <span className="text-slate-400">{stop.source === 'catalog' ? 'Từ dữ liệu dự án' : 'AI gợi ý, cần kiểm tra'}</span>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col gap-1">
                              <button type="button" aria-label={'Chỉnh sửa ' + stop.title}
                                onClick={() => setEditingStop(stop.id)}
                                className="rounded-lg p-2 text-slate-600 hover:bg-white">
                                <Pencil className="h-4 w-4"/>
                              </button>
                              <button type="button" aria-label={'Xóa ' + stop.title}
                                onClick={() => removeStop(selectedDay, stop.id)}
                                className="rounded-lg p-2 text-rose-600 hover:bg-rose-50">
                                <Trash2 className="h-4 w-4"/>
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                    </div> : null}
                  <button type="button" onClick={() => addStop(selectedDay)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <Plus className="h-4 w-4"/> Thêm hoạt động thủ công
                  </button>
                </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pb-5">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <CircleDollarSign className="h-4 w-4"/> {dirty ? 'Có thay đổi chưa lưu' : savedId ? 'Đang xem phiên bản đã lưu' : 'Chưa lưu'}
                  </p>
                  <button type="button" disabled={!authenticated || busySave}
                    onClick={() => void savePlan()}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-40">
                    <BookmarkCheck className="h-4 w-4"/> {savedId ? 'Lưu thay đổi' : 'Lưu lịch trình'}
                    <ArrowRight className="h-4 w-4"/>
                  </button>
                </div>
              </> : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
