export interface MapAction {
  label: string;
  url: string;
}

const MAPS_BASE = 'https://www.google.com/maps';

export function createGoogleMapsSearchUrl(query: string): string {
  const params = new URLSearchParams({
    api: '1',
    query,
    utm_source: 'vietnam-travel',
    utm_campaign: 'place_details_search',
  });

  return `${MAPS_BASE}/search/?${params.toString()}`;
}

export function createGoogleMapsDirectionsUrl(destination: string): string {
  const params = new URLSearchParams({
    api: '1',
    destination,
    utm_source: 'vietnam-travel',
    utm_campaign: 'directions_request',
  });

  return `${MAPS_BASE}/dir/?${params.toString()}`;
}
