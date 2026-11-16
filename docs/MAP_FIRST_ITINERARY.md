# Map-first itinerary generation (feature branch)

Scope: AI-generated schedules should prioritize real, named destinations locatable on the map over generic foods, transfers, or placeholder activities.

- AI Planner retrieves previously geocoded OSM places and published OSM destinations, scoped to the current province before calling Gemini.
- Gemini preferentially selects at least two prelocated places per day where there are enough choices; it must not invent restaurants or lat/lon.
- Map location endpoint uses verified coordinates directly, then tries rate-limited Nominatim for still-unlocated stops.
- Geocoding now accounts for officially merged former provinces and avoids demanding the new name in OSM search text.
- If map data is unavailable or insufficient, the plan still works but no false pins are created.
- No auto-publication of staged content, no fake coordinates, no database schema changes, no Google Places data on an OSM basemap, no Vercel deploy.

Verify: npm run typecheck, npm run typecheck:api, npm run test:api, npm run build.

## Moc Chau map-coverage follow-up (15 November 2026)

Screenshot: 4 AI stops, only "Thác Dải Yếm" got a real pin. "Bê chao Mộc Châu" is a dish, "Quán ăn bình dân Mộc Châu" is not a named establishment, and "Cao nguyên Mộc Châu" is a geographic region, not a precise stop.

Remedies:
- A deliberately small source-backed landmark reference list in `src/data/verifiedMapLandmarks.ts` adds four named Moc Chau waypoints, with public source URLs and approximate published coordinates: Thác Dải Yếm, Cầu kính Bạch Long, Đồi Chè Trái Tim and Ngũ Động Bản Ôn. Reference points are not a substitute for checking the final route.
- `getPriorityMapPlaces` prefers earlier positive, locally cached geocodes, then reviewed reference coordinates, then published OSM candidates.
- The AI prompt bans generic dish titles and explicitly prioritizes the available map-friendly named landmarks.
- The first (or specifically regenerated) day triggers **one** quality retry if at least two vetted points exist but the AI chooses fewer than two of them. A valid first result remains the fallback.
- Generic food venues and broad regions are not treated as geocodable places. Selecting an unlocated stop no longer displays a misleading card over another pin.
- The map uses verified/reference coordinates where available; it never claims the route line equals a driving route.

Source reference (auditable in the landmark data file):
- https://en.wikipedia.org/wiki/List_of_bridges_in_Vietnam
- https://en-ie.topographic-map.com/map-zfcptj/%C4%90%E1%BB%93i-Ch%C3%A8-Tr%C3%A1i-Tim/
- https://steller.co/p/th%25C3%25A1c-d%25E1%25BA%25A3i-y%25E1%25BA%25BFm-4SSZJK7FHzNYmCj4knacVGk
- https://steller.co/p/ng%25C5%25A9-%25C4%2591%25E1%25BB%2599ng-b%25E1%25BA%25A3n-3qa4ctpP3wapTjvVxqKMRrX

Future improvement: expand manually reviewed geo candidates for other provinces rather than fabricating GPS or bulk querying shared Nominatim endpoints.
