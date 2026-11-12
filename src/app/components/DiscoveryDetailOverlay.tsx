import { useEffect, useRef } from 'react';
import { ExternalLink, MapPin, X } from 'lucide-react';
import { createGoogleMapsSearchUrl } from '../../utils/googleMaps';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { ProvinceContent } from '../../data/provinceDetailsData';

export type DiscoveryKind = 'places' | 'cuisine';
export type DiscoveryItem = ProvinceContent['places'][number] | ProvinceContent['cuisine'][number];

interface Props {
  kind: DiscoveryKind;
  item: DiscoveryItem;
  provinceTitle: string;
  onClose: () => void;
}

export function DiscoveryDetailOverlay({ kind, item, provinceTitle, onClose }: Props) {
  const dialog = useRef<HTMLElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab' || !dialog.current) return;
      const focusable = [...dialog.current.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)')];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose]);

  const isPlace = kind === 'places';
  const label = isPlace ? 'Địa điểm du lịch' : 'Ẩm thực địa phương';
  const mapsQuery = isPlace ? item.name + ', ' + provinceTitle : item.name + ' ở ' + provinceTitle;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-2 backdrop-blur-[3px] sm:p-5"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="discovery-detail-title"
        className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none sm:rounded-3xl">
        <div className="relative h-48 shrink-0 bg-slate-100 sm:h-72">
          <ImageWithFallback src={item.image} alt={item.name} loading="eager" className="h-full w-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"/>
          <button type="button" onClick={onClose} aria-label="Đóng thông tin chi tiết"
            className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-gray-900 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <X className="h-5 w-5"/>
          </button>
          <div className="absolute bottom-4 left-5 right-5 text-white sm:bottom-6 sm:left-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/90">{label}</p>
            <h2 id="discovery-detail-title" className="text-2xl font-bold leading-tight sm:text-3xl">{item.name}</h2>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true"/>{provinceTitle}
          </div>
          <h3 className="mb-3 text-lg font-bold text-gray-950">{isPlace ? 'Giới thiệu địa điểm' : 'Giới thiệu món ăn'}</h3>
          <p className="whitespace-pre-line text-sm leading-7 text-gray-700 sm:text-base">{item.description}</p>
          {'detail' in item && typeof item.detail === 'string' && item.detail.trim() ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700 sm:text-base">{item.detail}</p>
          ) : (
            <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
              Thông tin chuyên sâu đang được bổ sung và đối chiếu nguồn. Nội dung hiện tại được giữ nguyên từ dữ liệu đã có.
            </p>
          )}
          {'sourceUrl' in item && typeof item.sourceUrl === 'string' && /^https:\/\//.test(item.sourceUrl) ? (
            <a className="mt-4 inline-flex text-xs font-medium text-blue-700 underline" href={item.sourceUrl}
              target="_blank" rel="noopener noreferrer">Nguồn tham khảo <ExternalLink className="ml-1 h-3 w-3"/></a>
          ) : null}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:px-8">
          <p className="text-xs text-gray-500">Thông tin mang tính tham khảo, vui lòng xác minh trước chuyến đi.</p>
          <a href={createGoogleMapsSearchUrl(mapsQuery)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            {isPlace ? 'Mở Google Maps' : 'Tìm món trên Google Maps'} <ExternalLink className="h-4 w-4"/>
          </a>
        </footer>
      </section>
    </div>
  );
}
