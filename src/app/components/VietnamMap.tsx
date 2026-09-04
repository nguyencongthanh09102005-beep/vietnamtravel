import { useEffect, useRef, useState } from 'react';
import { Expand, LoaderCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import mapSvgUrl from '../../imports/vietnam_map_split_new_01_07_(1).svg';

const MAP_ROOT_ID = 'vietnam_map_split_new_01_07';
const IGNORED_ID_PREFIXES = ['Vector', 'path-'];

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
      <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <div>
          <p className="font-semibold text-red-700">Không thể tải bản đồ Việt Nam</p>
          <p className="mt-1 text-sm text-red-600">Hãy tải lại trang để thử lại.</p>
        </div>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border border-gray-100 bg-sky-50">
        <LoaderCircle className="h-7 w-7 animate-spin text-sky-700" aria-hidden="true" />
        <span className="ml-2 text-sm font-medium text-sky-900">Đang tải bản đồ...</span>
      </div>
    );
  }

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-2xl border border-gray-100 bg-[#F7F7F9] shadow-inner">
      <style>{`
        .map-container svg {
          width: auto;
          height: 90%;
          max-width: 100%;
          display: block;
          margin: auto;
        }
        .map-container svg path {
          fill: #dbeafe !important;
          stroke: #117096;
          stroke-width: 0.6px;
          cursor: pointer;
          transition: fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease;
        }
        .map-container svg path:hover { fill: #0b2f5b !important; }
        .map-container svg [id="${selectedProvince}"] path,
        .map-container svg path[id="${selectedProvince}"] {
          fill: #051a46 !important;
          stroke: #1e40af;
          stroke-width: 3px;
        }
        .map-container svg [id="Hoang Sa"] path,
        .map-container svg [id="Truong Sa"] path { fill: #144b8a !important; }
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Phóng to bản đồ"
              >
                <ZoomIn className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => zoomOut()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Thu nhỏ bản đồ"
              >
                <ZoomOut className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => resetTransform()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Đặt lại bản đồ"
              >
                <Expand className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%', overflow: 'hidden' }}
              contentStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div
                className="map-container flex h-full w-full items-center justify-center overflow-hidden bg-[#E0F2FE]"
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
