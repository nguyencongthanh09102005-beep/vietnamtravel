import React, { useEffect, useState } from 'react';
import { ImageOff, MapPin, Utensils } from 'lucide-react';

type PlaceholderKind = 'places' | 'cuisine' | 'generic';

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholderKind?: PlaceholderKind;
};

/** A real SVG icon, not a fake broken <img> data URI. Distinguishes missing
 * verified media from a browser load failure (404, CORS or network issue).
 */
export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, onError, placeholderKind = 'generic', ...rest } = props;
  useEffect(() => setDidError(false), [src]);

  if (!src || didError) {
    const missing = !src;
    const Icon = placeholderKind === 'cuisine' ? Utensils
      : placeholderKind === 'places' ? MapPin : ImageOff;
    const label = missing ? 'Chưa có ảnh xác minh' : 'Ảnh tạm thời không tải được';
    return (
      <div className={'flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-slate-100 ' + (className ?? '')}
        role="img" aria-label={alt ? label + ' cho ' + alt : label} style={style}
        data-media-status={missing ? 'no-verified-photo' : 'load-failed'}>
        <div className="flex flex-col items-center justify-center gap-2 px-2 text-center text-slate-500">
          <Icon aria-hidden="true" className="h-8 w-8 shrink-0 opacity-45"/>
          <span className="text-[11px] font-medium leading-4">{label}</span>
        </div>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} style={style} {...rest}
    onError={event => {
      setDidError(true);
      onError?.(event);
    }}/>;
}
