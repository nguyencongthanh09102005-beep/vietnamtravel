import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ExternalLink, LocateFixed, MapPin, Minus, Plus, RefreshCw, Route } from 'lucide-react';
import type { ItineraryStop } from '../../utils/itinerary';
import {
  dayDirectionsLinks, isSpecificMapStop, mapSearchUrl, type MappedStop,
} from '../../utils/itinerary-map';

interface Props {
  provinceId: string;
  provinceName: string;
  stops: ItineraryStop[];
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
  points, stops, provinceName,
}: {
  points: MappedStop[];
  stops: ItineraryStop[];
  provinceName: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ width: 650, height: 320 });
  const [zoomAdjust, setZoomAdjust] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const selected = stops.find(s => s.id === activeId);
  const reset = () => { setZoomAdjust(0); setPan({ x: 0, y: 0 }); setActiveId(null); };

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
        const active = marker.id === activeId;
        return (
          <button key={marker.id} type="button"
            aria-label={`Điểm ${index + 1}: ${stops[index]?.title ?? marker.label}`}
            aria-pressed={active}
            title={stops[index]?.title ?? marker.label}
            onClick={() => setActiveId(active ? null : marker.id)}
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

export function ItineraryDayMap({ provinceId, provinceName, stops }: Props) {
  const [points, setPoints] = useState<MappedStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const searchable = useMemo(() => stops.filter(isSpecificMapStop), [stops]);
  const signature = JSON.stringify({ provinceId, stops: searchable.map(s => [s.id, s.title, s.category]) });
  const links = useMemo(() => dayDirectionsLinks(stops, provinceName), [stops, provinceName]);

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

  return (
    <section aria-label="Bản đồ lịch trình theo ngày" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-950">
            <MapPin className="h-4 w-4 text-emerald-700"/> Bản đồ ngày này
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {points.length}/{stops.length} hoạt động có vị trí tham khảo
            {loading ? ' · Đang tìm vị trí…' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setRetry(v => v + 1)}
          disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={'h-3.5 w-3.5 ' + (loading ? 'animate-spin' : '')}/> Thử định vị lại
        </button>
      </div>

      {points.length ? <TilePinMap key={signature} points={points} stops={stops} provinceName={provinceName}/> : (
        <div className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
          <MapPin className="mb-2 h-7 w-7 text-slate-400"/>
          <p className="text-sm font-semibold text-slate-800">{loading ? 'Đang định vị các điểm tham quan…' : 'Chưa có vị trí đủ rõ để ghim lên bản đồ'}</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
            {loading ? 'Bản đồ sẽ hiện khi tìm được vị trí phù hợp.' :
              'Nếu AI chỉ gợi ý tên món ăn hoặc hoạt động chung, hãy sửa thành tên quán hay địa điểm cụ thể.'}
          </p>
        </div>
      )}
      {error ? <p role="status" className="mt-2 text-xs text-amber-700">{error}</p> : null}
      {notLocated.length ? <p className="mt-2 text-xs leading-5 text-slate-500">
        Chưa ghim: {notLocated.slice(0, 4).map(s => s.title).join(', ')}{notLocated.length > 4 ? ` và ${notLocated.length - 4} điểm khác` : ''}.
      </p> : null}
      <p className="mt-2 text-[11px] leading-5 text-slate-500">
        Ghim tham khảo từ OpenStreetMap; đường nét đứt chỉ nối thứ tự các điểm, <strong>không phải tuyến đường thực tế</strong>.
        Hãy xác minh điểm đến, khoảng cách và giờ mở cửa trước khi đi.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map(link => (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800">
            <Route className="h-4 w-4"/> {link.label} <ExternalLink className="h-3.5 w-3.5"/>
          </a>
        ))}
        {!links.length && stops.length ? (
          <a href={mapSearchUrl(stops[0].title, provinceName)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <ExternalLink className="h-4 w-4"/> Tìm điểm đầu trên Google Maps
          </a>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-slate-500">
        Chỉ đường do Google Maps tìm theo tên địa điểm, không phải tuyến đã kiểm chứng. Các món ăn chung không được đưa vào tuyến.
      </p>
    </section>
  );
}
