import React, { useEffect, useState, MouseEvent } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Expand } from 'lucide-react';
import mapSvgUrl from '../../imports/vietnam_map_split_new_01_07_(1).svg';

export function VietnamMap({ 
  selectedProvince, 
  onSelect 
}: { 
  selectedProvince: string; 
  onSelect: (prov: string) => void;
}) {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    fetch(mapSvgUrl)
      .then((res) => res.text())
      .then((text) => {
        // Strip out hardcoded fills and opacities so CSS can take over
        let cleanText = text
            .replace(/fill="#ED1C24"/gi, '')
            .replace(/fill-opacity="0\.56"/gi, '');
        setSvgContent(cleanText);
      });
  }, []);

const handleClick = (
  e: React.MouseEvent<HTMLDivElement>,
  zoomToElement: any
) => {
  const target = e.target as SVGElement;
  const region = target.closest('[id]');

  if (region && region.id) {
    if (
      region.id !== 'vietnam_map_split_new_01_07' &&
      !region.id.startsWith('Vector') &&
      !region.id.startsWith('path-')
    ) {

      onSelect(region.id);

      zoomToElement(
      region,
      3,
      600
     );
    }
  }
};
  return (
    <div className="relative w-full h-full bg-[#F7F7F9] rounded-2xl overflow-hidden border border-gray-100 shadow-inner group">
  <style>
{`
  .map-container svg {
    width: auto;
    height: 90%;
    max-width: 100%;
    display: block;
    margin: auto;
  }

  /* DEFAULT */
  .map-container svg path {
    fill: #dbeafe !important;
    stroke: #117096;
    stroke-width: 0.6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /* HOVER */
  .map-container svg path:hover {
    fill: #0b2f5b !important;
  }

  /* SELECTED */
  .map-container svg [id="${selectedProvince}"] path,
  .map-container svg path[id="${selectedProvince}"] {
    fill: #051a46 !important;
    stroke: #1e40af;
    stroke-width: 3px;
  }

  /* ISLAND */
  .map-container svg [id="Hoang Sa"] path,
  .map-container svg [id="Truong Sa"] path {
    fill: #144b8a !important;
  }
`}
</style>
      
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={6}
        centerOnInit={true}
        centerZoomedOut={true}
        limitToBounds={false}
        smooth={true}
        wheel={{ step: 0.1 }}
      >
       {({ zoomIn, zoomOut, resetTransform, zoomToElement }) => (
          <>
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button 
                onClick={() => zoomIn()} 
                className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-100 transition-colors"
                title="Phóng to"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={() => zoomOut()} 
                className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-100 transition-colors"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button 
                onClick={() => resetTransform()} 
                className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-100 transition-colors"
                title="Đặt lại"
              >
                <Expand className="w-5 h-5" />
              </button>
            </div>
            
            <TransformComponent
  wrapperStyle={{
    width: "100%",
    height: "100%",
    overflow: "hidden",
  }}
  contentStyle={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <div
    className="map-container w-full h-full flex items-center justify-center overflow-hidden bg-[#E0F2FE]"
    dangerouslySetInnerHTML={{ __html: svgContent }}
    onClick={(e) => handleClick(e, zoomToElement)}
  />
</TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}