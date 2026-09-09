export interface MapAction {
  label: string;
  url: string;
}

export interface PlaceCard {
  id: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUrl: string;
  directionsUrl: string;
}

const MAPS_BASE = 'https://www.google.com/maps';

export function createGoogleMapsSearchUrl(query: string, placeId?: string): string {
  const params = new URLSearchParams({
    api: '1',
    query,
    utm_source: 'vietnam-travel',
    utm_campaign: 'place_details_search',
  });

  if (placeId) params.set('query_place_id', placeId);

  return `${MAPS_BASE}/search/?${params.toString()}`;
}

export function createGoogleMapsDirectionsUrl(destination: string, placeId?: string): string {
  const params = new URLSearchParams({
    api: '1',
    destination,
    utm_source: 'vietnam-travel',
    utm_campaign: 'directions_request',
  });

  if (placeId) params.set('destination_place_id', placeId);

  return `${MAPS_BASE}/dir/?${params.toString()}`;
}
