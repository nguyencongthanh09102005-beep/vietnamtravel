import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ExternalLink, LocateFixed, MapPin, Minus, Pencil, Plus, RefreshCw, Route } from 'lucide-react';
import type { ItineraryStop } from '../../utils/itinerary';
import {
  dayAirDistanceKm, dayDirectionsLinks, isSpecificMapStop, mapSearchUrl, type MappedStop,
} from '../../utils/itinerary-map';

interface Props {
  provinceId: string;
  provinceName: string;
  stops: ItineraryStop[];
  onEditStop?: (id: string) => void;
}

interface LocationResponse {
  points?: MappedStop[];
  unlocatedIds?: string[];
  pending?: boolean;
  retryAfterMs?: number;
  error?: string;
}

const TILE_SIZE = 256;
const MERCATOR_MAX_LAT = 85.05112878;
const project = (lat: number, lon: number) => {
  const latitude = Math.max(-MERCATOR_MAX_LAT, Math.min(MERCATOR_MAX_LAT, lat));
  const rad = latitude * Math.PI / 180;
  return {
    x: (lon + 180) / 360,
    y: (1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2,
  };
};

function fitZoom(points: MappedStop[], width: number, height: number) {
  if (points.length === 1) return 14;
  const projected = points.map(p => project(p.lat, p.lon));
  const dx = Math.max(...projected.map(p => p.x)) - Math.min(...projected.map(p => p.x));
  const dy = Math.max(...projected.map(p => p.y)) - Math.min(...projected.map(p => p.y));
  for (let zoom = 15; zoom >= 4; zoom--) {
    const size = TILE_SIZE * 2 ** zoom;
    if (dx * size <= Math.max(100, width - 110) && dy * size <= Math.max(100, height - 110)) return zoom;
  }
  return 4;
}

function TilePinMap({
  points, stops, provinceName, activeStopId, onSelectStop,
}: {
  points: MappedStop[];
  stops: ItineraryStop[];
  provinceName: string;
  activeStopId: string | null;
  onSelectStop: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ width: 650, height: 320 });
  const [zoomAdjust, setZoomAdjust] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const view = useMemo(() => {
    const projected = points.map(p => project(p.lat, p.lon));
    const minX = Math.min(...projected.map(p => p.x));
    const maxX = Math.max(...projected.map(p => p.x));
    const minY = Math.min(...projected.map(p => p.y));
    const maxY = Math.max(...projected.map(p => p.y));
    const zoom = Math.max(3, Math.min(17, fitZoom(points, size.width, size.height) + zoomAdjust));
    const world = TILE_SIZE * 2 ** zoom;
    const left = (minX + maxX) / 2 * world - size.width / 2 - pan.x;
    const top = (minY + maxY) / 2 * world - size.height / 2 - pan.y;
    const maxTile = 2 ** zoom - 1;
    const tiles: { x: number; y: number; left: number; top: number }[] = [];
    const firstX = Math.max(0, Math.floor(left / TILE_SIZE));
    const lastX = Math.min(maxTile, Math.floor((left + size.width) / TILE_SIZE));
    const firstY = Math.max(0, Math.floor(top / TILE_SIZE));
    const lastY = Math.min(maxTile, Math.floor((top + size.height) / TILE_SIZE));
    for (let x = firstX; x <= lastX; x++) for (let y = firstY; y <= lastY; y++) {
      tiles.push({ x, y, left: x * TILE_SIZE - left, top: y * TILE_SIZE - top });
    }
    const markers = points.map(p => {
      const coordinate = project(p.lat, p.lon);
      return { ...p, x: coordinate.x * world - left, y: coordinate.y * world - top };
    });
    return { tiles, markers, zoom };
  }, [points, size, pan, zoomAdjust]);

  const selected = stops.find(s => s.id === activeStopId);
  const reset = () => { setZoomAdjust(0); setPan({ x: 0, y: 0 }); };

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.target !== event.currentTarget) return;
    drag.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = { x: event.clientX, y: event.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };

  return (
    <div ref={mapRef} className="relative h-[280px] w-full touch-pan-y overflow-hidden rounded-xl bg-slate-100 sm:h-[355px]"
      role="group" aria-label="Bản đồ OpenStreetMap với các điểm đã định vị">
      <div className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={startPan} onPointerMove={movePan}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
        {view.tiles.map(tile => (
          <img key={view.zoom + '-' + tile.x + '-' + tile.y}
            src={`https://tile.openstreetmap.org/${view.zoom}/${tile.x}/${tile.y}.png`}
            alt="" draggable={false} decoding="async"
            className="pointer-events-none absolute max-w-none select-none"
            style={{ left: tile.left, top: tile.top, width: TILE_SIZE, height: TILE_SIZE }}
          />
        ))}
      </div>
      {view.markers.length > 1 ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true">
          <polyline points={view.markers.map(p => p.x + ',' + p.y).join(' ')}
            fill="none" stroke="#059669" strokeWidth="3" strokeDasharray="7 7" strokeLinecap="round"/>
        </svg>
      ) : null}
      {view.markers.map(marker => {
        const index = stops.findIndex(stop => stop.id === marker.id);
        const active = marker.id === activeStopId;
        return (
          <button key={marker.id} type="button"
            aria-label={`Điểm ${index + 1}: ${stops[index]?.title ?? marker.label}`}
            aria-pressed={active}
            title={stops[index]?.title ?? marker.label}
            onClick={() => onSelectStop(marker.id)}
            onPointerDown={event => event.stopPropagation()}
            className={'absolute z-10 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white text-xs font-extrabold text-white shadow-lg transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ' +
              (active ? 'scale-125 bg-slate-900' : 'bg-emerald-700 hover:scale-110')}
            style={{ left: marker.x, top: marker.y, transform: 'translate(-50%, -50%)' }}>
            {index + 1}
          </button>
        );
      })}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/95 p-1 shadow-sm">
        <button type="button" aria-label="Phóng to bản đồ" onClick={() => setZoomAdjust(v => Math.min(v + 1, 3))}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><Plus className="h-4 w-4"/></button>
        <button type="button" aria-label="Thu nhỏ bản đồ" onClick={() => setZoomAdjust(v => Math.max(v - 1, -4))}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><Minus className="h-4 w-4"/></button>
        <button type="button" aria-label="Hiện toàn bộ điểm" onClick={reset}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><LocateFixed className="h-4 w-4"/></button>
      </div>
      {selected ? (
        <div className="absolute bottom-9 left-3 right-3 z-20 max-w-[310px] rounded-xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur">
          <p className="line-clamp-2 text-xs font-bold text-slate-900">{selected.title}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {points.some(point => point.id === selected.id) ? 'Có vị trí tham khảo' : 'Chưa có ghim xác minh'}
          </p>
          <a href={mapSearchUrl(selected.title, provinceName)} target="_blank" rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
            Xác minh trên Google Maps <ExternalLink className="h-3 w-3"/>
          </a>
        </div>
      ) : null}
      <div className="absolute bottom-0 right-0 z-20 rounded-tl-md bg-white/95 px-2 py-1 text-[10px] text-slate-700">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap contributors</a>
      </div>
    </div>
  );
}

export function ItineraryDayMap({ provinceId, provinceName, stops, onEditStop }: Props) {
  const [points, setPoints] = useState<MappedStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const searchable = useMemo(() => stops.filter(isSpecificMapStop), [stops]);
  const signature = JSON.stringify({ provinceId, stops: searchable.map(s => [s.id, s.title, s.category]) });
  const links = useMemo(() => dayDirectionsLinks(stops, provinceName, points), [stops, provinceName, points]);
  const airKm = useMemo(() => dayAirDistanceKm(stops, points), [stops, points]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const controller = new AbortController();
    setPoints([]);
    setError('');
    if (!searchable.length) {
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    const resolve = async (attempt: number) => {
      try {
        const response = await fetch('/api/itineraries/locations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provinceId, stops: searchable.map(s => ({
            id: s.id, title: s.title, category: s.category,
          })) }),
          signal: controller.signal,
        });
        const payload = await response.json() as LocationResponse;
        if (!response.ok) throw new Error(payload.error || 'Không thể định vị địa điểm.');
        if (cancelled) return;
        setPoints(payload.points ?? []);
        if (payload.pending && attempt < 18) {
          timer = window.setTimeout(() => { void resolve(attempt + 1); },
            Math.max(1650, Math.min(4000, payload.retryAfterMs ?? 1900)));
        } else {
          setLoading(false);
          if (payload.pending) setError('Một số điểm chưa tải được vị trí. Bạn có thể thử lại.');
        }
      } catch (cause) {
        if (cancelled || controller.signal.aborted) return;
        setLoading(false);
        setError(cause instanceof Error ? cause.message : 'Không thể tải bản đồ.');
      }
    };
    void resolve(0);
    return () => {
      cancelled = true;
      controller.abort();
      if (timer) window.clearTimeout(timer);
    };
    // Signature is content-based to avoid re-geocoding when only costs/descriptions change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, retry]);

  const locatedIds = new Set(points.map(p => p.id));
  const notLocated = stops.filter(s => !locatedIds.has(s.id));
  const selected = stops.find(stop => stop.id === selectedStopId) ?? stops[0] ?? null;

  return (
    <section aria-label="Bản đồ lịch trình theo ngày" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(235px,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-w-0 border-b border-slate-200 p-4 xl:border-b-0 xl:border-r xl:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">Lộ trình ngày này</h3>
            <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
              {stops.length} hoạt động
            </span>
          </div>
          <ol aria-label="Các điểm theo thứ tự trong lịch trình" className="relative space-y-1">
            {stops.map((stop, index) => {
              const active = selected?.id === stop.id;
              const positioned = locatedIds.has(stop.id);
              const next = stops[index + 1];
              const segmentKm = next ? dayAirDistanceKm([stop, next], points) : null;
              const periodName = { morning: 'Sáng', noon: 'Trưa', afternoon: 'Chiều', evening: 'Tối' }[stop.period];
              return (
                <li key={stop.id} className="relative">
                  <button type="button" aria-pressed={active} onClick={() => setSelectedStopId(stop.id)}
                    className={'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ' +
                      (active ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50')}>
                    <span className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ' +
                      (active ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-emerald-200 bg-white text-emerald-700')}>
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-medium text-slate-500">{stop.startTime} · {periodName}</span>
                      <span className="mt-1 block break-words text-sm font-bold text-slate-900">{stop.title}</span>
                      <span className="mt-1 block text-[11px] text-slate-500">
                        {positioned ? 'Có ghim bản đồ' : isSpecificMapStop(stop) ? 'Chưa định vị được' : 'Hoạt động không có vị trí cụ thể'}
                      </span>
                    </span>
                  </button>
                  {next ? (
                    <div className="flex items-center gap-2 py-2 pl-6 text-[11px] text-slate-500" aria-label="Chặng di chuyển tiếp theo">
                      <span aria-hidden="true" className="text-emerald-600">↓</span>
                      {segmentKm === null
                        ? 'Chặng di chuyển · Kiểm tra trên Google Maps'
                        : String(segmentKm.toLocaleString('vi-VN')) + ' km đường chim bay'}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
          {selected ? (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-900">{selected.title}</p>
              <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">{selected.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <a href={mapSearchUrl(selected.title, provinceName)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
                  Xem trên Maps <ExternalLink className="h-3 w-3" aria-hidden="true"/>
                </a>
                {onEditStop ? (
                  <button type="button" onClick={() => onEditStop(selected.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
                    <Pencil className="h-3 w-3" aria-hidden="true"/> Chỉnh sửa
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            Thứ tự do lịch trình đề xuất, chưa tối ưu theo giao thông thực tế.
          </p>
        </div>

        <div className="min-w-0 p-4 xl:p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                <MapPin className="h-4 w-4 text-emerald-700" aria-hidden="true"/> Bản đồ hành trình
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {points.length}/{searchable.length} địa điểm đủ cụ thể đã ghim
                {loading ? ' · Đang tìm vị trí…' : ''}
              </p>
            </div>
            <button type="button" onClick={() => setRetry(value => value + 1)}
              disabled={loading || !searchable.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <RefreshCw className={'h-3.5 w-3.5 ' + (loading ? 'animate-spin' : '')} aria-hidden="true"/>
              Định vị lại
            </button>
          </div>
          {points.length ? (
            <TilePinMap key={signature} points={points} stops={stops} provinceName={provinceName}
              activeStopId={selected?.id ?? null} onSelectStop={setSelectedStopId}/>
          ) : (
            <div className="flex min-h-[310px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center sm:min-h-[355px]">
              <MapPin className="mb-2 h-7 w-7 text-slate-400" aria-hidden="true"/>
              <p className="text-sm font-semibold text-slate-800">
                {loading ? 'Đang tìm vị trí các điểm tham quan…' : 'Chưa có ghim đủ tin cậy'}
              </p>
              <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                Vị trí chỉ xuất hiện khi dịch vụ bản đồ trả về điểm phù hợp. Bạn vẫn có thể tìm từng địa danh trên Google Maps.
              </p>
            </div>
          )}
          {error ? <p role="status" className="mt-2 text-xs text-amber-700">{error}</p> : null}
          {notLocated.length ? (
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              Chưa ghim: {notLocated.slice(0, 3).map(stop => stop.title).join(', ')}
              {notLocated.length > 3 ? ' và ' + (notLocated.length - 3) + ' hoạt động khác' : ''}.
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 text-[11px] leading-5 text-slate-500">
              <p>Khoảng cách thực tế: <strong className="font-semibold text-slate-800">Xem trên Google Maps</strong></p>
              {airKm !== null ? <p>Đường chim bay (tham khảo): {airKm.toLocaleString('vi-VN')} km</p> : null}
              <p>Đường nét đứt chỉ nối các ghim, không phải tuyến đường thực.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {links.map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-800">
                  <Route className="h-4 w-4" aria-hidden="true"/> {link.label}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true"/>
                </a>
              ))}
              {!links.length && stops.length ? (
                <a href={mapSearchUrl(stops[0].title, provinceName)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Tìm điểm trên Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true"/>
                </a>
              ) : null}
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            Link chỉ đường ưu tiên tọa độ đã xác minh và giữ thứ tự điểm dừng. Google Maps sẽ tính đường và thời gian thực tế;
            hãy kiểm tra lại trước khi di chuyển.
          </p>
        </div>
      </div>
    </section>
  );
}
