import type { ItineraryRequest, StructuredItinerary } from '../../src/utils/itinerary.js';
import { normalizeItinerary } from '../../src/utils/itinerary.js';
import { matchKnownMapPlaceById, type PriorityMapPlace } from './itinerary-map-priority.js';

const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Strict database-first AI contract.
 *
 * Gemini is allowed to schedule vetted place IDs, but cannot choose coordinates,
 * names, source classification or business categories. Those all come from the
 * server-side eligible catalog. A hallucinated ID invalidates the response.
 *
 * Output retains schemaVersion 1 so existing saved plans load unchanged.
 */
export function normalizeGroundedItinerary(
  raw: unknown, request: ItineraryRequest, available: PriorityMapPlace[],
): StructuredItinerary | null {
  if (!object(raw) || !Array.isArray(raw.schedule) || raw.schedule.length !== request.days ||
    !available.length) return null;
  const schedule: Array<{ day: number; stops: Record<string, unknown>[] }> = [];
  for (let index = 0; index < request.days; index++) {
    const day = raw.schedule[index];
    if (!object(day) || day.day !== index + 1 || !Array.isArray(day.stops) ||
      day.stops.length < Math.min(2, available.length) ||
      day.stops.length > Math.min(5, available.length)) return null;
    const used = new Set<string>();
    const stops: Record<string, unknown>[] = [];
    for (const row of day.stops) {
      if (!object(row) || typeof row.placeId !== 'string') return null;
      const found = matchKnownMapPlaceById(row.placeId, available);
      if (!found || used.has(found.id)) return null;
      used.add(found.id);
      // Disregard any title, category, source or coordinates invented by AI.
      stops.push({
        ...row,
        placeId: found.id,
        title: found.name,
        category: 'activities',
        source: 'ai_suggestion',
      });
    }
    schedule.push({ day: index + 1, stops });
  }
  return normalizeItinerary({ ...raw, schedule }, request);
}
