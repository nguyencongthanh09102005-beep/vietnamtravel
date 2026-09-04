import { useEffect, useRef, useState } from 'react';
import { Expand, LoaderCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { provincesData } from '../../data/provincesData';
import mapSvgUrl from '../../imports/vietnam_map_split_new_01_07_(1).svg';

const MAP_ROOT_ID = 'vietnam_map_split_new_01_07';
const IGNORED_ID_PREFIXES = ['Vector', 'path-'];
const PROVINCE_PALETTE = [
  '#BAE6FD',
  '#A7F3D0',
  '#FDE68A',
  '#FBCFE8',
  '#DDD6FE',
  '#BFDBFE',
  '#99F6E4',
  '#FED7AA',
];

const provinceColorRules = Object.keys(provincesData)
  .map((province, index) => {
    const color = PROVINCE_PALETTE[index % PROVINCE_PALETTE.length];
    return `
      .map-container svg [id="${province}"] path,
      .map-container svg path[id="${province}"] {
        fill: ${color} !important;
      }
    `;
  })
  .join('\n');

function findProvinceElement(target: Element | null): Element | null {
  let element = target;

  while (element) {
    const id = element.id;
    if (
      id &&
      id !== MAP_ROOT_ID &&
      !IGNORED_ID_PREFIXES.some((prefix) => id.startsWith(prefix))
    ) {
      return element;
    }
    element = element.parentElement;
  }

  return null;
}

export function VietnamMap({
  selectedProvince,
  onSelect,
}: {
  selectedProvince: string;
  onSelect: (province: string) => void;
}) {
  const [svgContent, setSvgContent] = useState('');
  const [loadError, setLoadError] = useState(false);
  const transformRef = useRef<any>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(mapSvgUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Map request failed: ${response.status}`);
        return response.text();
      })
      .then((text) => {
        const cleanedText = text
          .replace(/fill="#ED1C24"/gi, '')
          .replace(/fill-opacity="0\.56"/gi, '');
        setSvgContent(cleanedText);
        setLoadError(false);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Unable to load Vietnam map', error);
        setLoadError(true);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedProvince || !svgContent || !transformRef.current) return;

    const frame = requestAnimationFrame(() => {
      const mapContainer = document.querySelector('.map-container');
      const escapedId = CSS.escape(selectedProvince);
      const region = mapContainer?.querySelector(`#${escapedId}`);

      if (region) {
        transformRef.current.zoomToElement(region, 3, 500);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedProvince, svgContent]);

  const chooseFromEventTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return;
    const region = findProvinceElement(target);
    if (!region?.id) return;
    onSelect(region.id);
  };

  if (loadError) {
    return (
      <div className="flex h-full min-h-72 items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
        <div>
          <p className="font-semibold text-red-700">Không thể tải bản đồ Việt Nam</p>
          <p className="mt-1 text-sm text-red-600">Hãy tải lại trang để thử lại.</p>
        </div>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="flex h-full min-h-72 items-center justify-center rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-50">
        <LoaderCircle className="h-7 w-7 animate-spin text-sky-700" aria-hidden="true" />
        <span className="ml-2 text-sm font-medium text-sky-900">Đang tải bản đồ...</span>
      </div>
    );
  }

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-50 shadow-[0_20px_55px_-32px_rgba(14,116,144,0.55)] ring-1 ring-sky-100/80">
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-4 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/3 h-40 w-40 rounded-full bg-amber-200/20 blur-3xl" />

      <style>{`
        .map-container svg {
          width: auto;
          height: 90%;
          max-width: 100%;
          display: block;
          margin: auto;
          filter: drop-shadow(0 16px 24px rgba(15, 23, 42, 0.10));
        }
        .map-container svg path {
          fill: #dbeafe !important;
          stroke: #0e7490;
          stroke-width: 0.62px;
          cursor: pointer;
          transition: fill 0.22s ease, stroke 0.22s ease, stroke-width 0.22s ease, filter 0.22s ease, opacity 0.22s ease;
        }
        ${provinceColorRules}
        .map-container svg path:hover {
          fill: #fb7185 !important;
          stroke: #be123c;
          stroke-width: 1.25px;
          filter: drop-shadow(0 3px 5px rgba(190, 24, 93, 0.24));
        }
        .map-container svg [id="${selectedProvince}"] path,
        .map-container svg path[id="${selectedProvince}"] {
          fill: #0f766e !important;
          stroke: #064e3b;
          stroke-width: 3px;
          filter: drop-shadow(0 5px 8px rgba(15, 118, 110, 0.38));
        }
        .map-container svg [id="Hoang Sa"] path,
        .map-container svg [id="Truong Sa"] path {
          fill: #38bdf8 !important;
        }
      `}</style>

      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={1}
        maxScale={6}
        centerOnInit
        centerZoomedOut
        limitToBounds={false}
        smooth
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => zoomIn()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label="Phóng to bản đồ"
              >
                <ZoomIn className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => zoomOut()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label="Thu nhỏ bản đồ"
              >
                <ZoomOut className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => resetTransform()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label="Đặt lại bản đồ"
              >
                <Expand className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
              Tỉnh đang chọn
              <span className="ml-1 h-2.5 w-2.5 rounded-full bg-rose-400" />
              Di chuột để khám phá
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%', overflow: 'hidden' }}
              contentStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div
                className="map-container flex h-full w-full items-center justify-center overflow-hidden bg-transparent"
                dangerouslySetInnerHTML={{ __html: svgContent }}
                onClick={(event) => chooseFromEventTarget(event.target)}
                role="img"
                aria-label="Bản đồ tương tác các tỉnh thành Việt Nam"
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
