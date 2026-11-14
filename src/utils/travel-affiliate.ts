/** Public partner URLs only. Never put secrets in VITE_ variables. */
export type TravelServiceId = 'booking' | 'traveloka' | 'klook' | 'vexere';
export type TravelServiceCategory = 'stay' | 'experience' | 'transport';
export interface TravelServiceLink {
  id: TravelServiceId;
  name: string;
  category: TravelServiceCategory;
  caption: string;
  url: string;
  partnerConfigured: boolean;
}
export type TravelPartnerOverrides = Partial<Record<TravelServiceId, string | undefined>>;

/** Only use approved tracking URLs; {destination} is optional. */
function configuredUrl(template: string | undefined, destination: string): string | null {
  if (!template || template.length > 2048) return null;
  try {
    const expanded = template.trim().replaceAll('{destination}', encodeURIComponent(destination));
    const value = new URL(expanded);
    if (value.protocol !== 'https:' || value.username || value.password || !value.hostname ||
        value.hostname === 'localhost' || value.hostname.endsWith('.local')) return null;
    return value.toString();
  } catch { return null; }
}

/** Unconfigured buttons lead to regular sites and earn no affiliate commission. */
export function travelServiceLinks(destination: string, overrides: TravelPartnerOverrides = {}): TravelServiceLink[] {
  const location = destination.trim().slice(0, 120) || 'Việt Nam';
  const defaults: Array<Omit<TravelServiceLink, 'url' | 'partnerConfigured'> & { defaultUrl: string }> = [
    { id: 'booking', name: 'Booking.com', category: 'stay', caption: 'Tìm nơi lưu trú',
      defaultUrl: 'https://www.booking.com/searchresults.vi.html?ss=' + encodeURIComponent(location + ', Việt Nam') },
    { id: 'traveloka', name: 'Traveloka', category: 'stay', caption: 'Khách sạn và vé máy bay',
      defaultUrl: 'https://www.traveloka.com/vi-vn' },
    { id: 'klook', name: 'Klook', category: 'experience', caption: 'Vé tham quan và trải nghiệm',
      defaultUrl: 'https://www.klook.com/vi/' },
    { id: 'vexere', name: 'VeXeRe', category: 'transport', caption: 'Tìm vé xe',
      defaultUrl: 'https://vexere.com/' },
  ];
  return defaults.map(({ defaultUrl, ...item }) => {
    const partnerUrl = configuredUrl(overrides[item.id], location);
    return { ...item, url: partnerUrl ?? defaultUrl, partnerConfigured: Boolean(partnerUrl) };
  });
}
