/** Public service links. VITE_ environment values must never contain secrets. */
export type TravelServiceId = 'booking' | 'traveloka' | 'klook' | 'vexere';
export type TravelServiceCategory = 'stay' | 'experience' | 'transport';
export interface TravelServiceLink {
  id: TravelServiceId;
  name: string;
  category: TravelServiceCategory;
  caption: string;
  url: string;
  partnerConfigured: boolean;
  /** True only if the URL actually names the selected destination. */
  destinationPrefilled: boolean;
}
export type TravelPartnerOverrides = Partial<Record<TravelServiceId, string | undefined>>;

export function travelDestinationLabel(provinceName: string): string {
  return (provinceName.replace(/^(?:Tỉnh|TP\.)\s*/iu, '').trim().slice(0, 120) || 'Việt Nam');
}
export function canOfferTravelServices(provinceId?: string): boolean {
  return provinceId !== 'Hoang Sa' && provinceId !== 'Truong Sa';
}

/** Valid public HTTPS affiliate URLs; {destination} may be substituted. */
function configuredUrl(template: string | undefined, destination: string): string | null {
  if (!template || template.length > 2048) return null;
  try {
    const expanded = template.trim().replaceAll('{destination}', encodeURIComponent(destination));
    const url = new URL(expanded);
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname ||
        url.hostname === 'localhost' || url.hostname.endsWith('.local')) return null;
    return url.toString();
  } catch { return null; }
}

/** All normal links are non-affiliate; no route, seat or price availability is implied. */
export function travelServiceLinks(provinceName: string, overrides: TravelPartnerOverrides = {}): TravelServiceLink[] {
  const destination = travelDestinationLabel(provinceName);
  const defaults: Array<Omit<TravelServiceLink, 'url' | 'partnerConfigured' | 'destinationPrefilled'> & {
    defaultUrl: string; defaultPrefilled: boolean;
  }> = [
    {
      id: 'booking', name: 'Booking.com', category: 'stay',
      caption: 'Tìm khách sạn tại ' + destination,
      defaultUrl: 'https://www.booking.com/searchresults.vi.html?ss=' + encodeURIComponent(destination + ', Việt Nam'),
      defaultPrefilled: true,
    },
    {
      id: 'traveloka', name: 'Traveloka', category: 'transport',
      caption: 'Tìm vé máy bay đến ' + destination,
      defaultUrl: 'https://www.traveloka.com/vi-vn/flight',
      defaultPrefilled: false,
    },
    {
      id: 'klook', name: 'Klook', category: 'experience',
      caption: 'Vé tham quan và trải nghiệm tại ' + destination,
      defaultUrl: destination === 'Hà Nội'
        ? 'https://www.klook.com/vi/destination/c34-hanoi/'
        : 'https://www.klook.com/vi/',
      defaultPrefilled: destination === 'Hà Nội',
    },
    {
      id: 'vexere', name: 'VeXeRe', category: 'transport',
      caption: 'Tìm vé xe khách đến ' + destination,
      defaultUrl: 'https://vexere.com/vi-VN',
      defaultPrefilled: false,
    },
  ];
  return defaults.map(({ defaultUrl, defaultPrefilled, ...item }) => {
    const template = overrides[item.id];
    const partnerUrl = configuredUrl(template, destination);
    return {
      ...item,
      url: partnerUrl ?? defaultUrl,
      partnerConfigured: Boolean(partnerUrl),
      destinationPrefilled: partnerUrl ? Boolean(template?.includes('{destination}')) : defaultPrefilled,
    };
  });
}
