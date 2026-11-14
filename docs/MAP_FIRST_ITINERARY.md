# Map-first itinerary generation (feature branch)

Scope: AI-generated schedules should prioritize real, named destinations locatable on the map over generic foods, transfers, or placeholder activities.

- AI Planner retrieves previously geocoded OSM places and published OSM destinations, scoped to the current province before calling Gemini.
- Gemini preferentially selects at least two prelocated places per day where there are enough choices; it must not invent restaurants or lat/lon.
- Map location endpoint uses verified coordinates directly, then tries rate-limited Nominatim for still-unlocated stops.
- Geocoding now accounts for officially merged former provinces and avoids demanding the new name in OSM search text.
- If map data is unavailable or insufficient, the plan still works but no false pins are created.
- No auto-publication of staged content, no fake coordinates, no database schema changes, no Google Places data on an OSM basemap, no Vercel deploy.

Verify: npm run typecheck, npm run typecheck:api, npm run test:api, npm run build.
