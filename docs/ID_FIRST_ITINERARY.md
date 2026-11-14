# ID-first AI itinerary planner (2026-11-15)

This branch implements **database-first grounding** so newly AI-generated itinerary stops carry the server-selected \`placeId\`. The map resolves the exact same \`placeId\` directly; no free-text geocoding is needed for new grounded plans.

## Data model

- Existing schema \`schemaVersion: 1\` and prior saved schedules are preserved.
- Each new stop includes an optional \`placeId: "p_<20 hex>"\`. Old and manually authored stops have no ID.
- Stable ID: \`p_\` + first 20 hex characters of SHA-256(\`provinceId + "\\n" + normalizedPlaceName\`). The source is unambiguous within each province and no external database migration is needed.
- Allowed catalog: positive geocode cache entries from existing provincial catalog, reviewed reference coordinates, and **published** OSM candidates in \`travel_external_geodata\`. Pending/rejected candidates are not eligible.
- AI sees allowed \`placeId\` values and names, selects only IDs, and writes descriptions, order, times and budget.
- Server-side \`normalizeGroundedItinerary\` discards AI's freeform titles, categories and GPS, checks each ID against the exact provincial catalog, rejects unknown/duplicate IDs and restores the canonical names.
- Each day has at least 2 distinct pinned stops when 2+ places are available. If only 1 pinned place is known, a single pinned stop is possible. If **none** exists, planner returns an honest \`422\` explanation instead of inventing a stop.

## Legacy/backward compatibility

- Old saved \`schemaVersion: 1\` plans without \`placeId\` still load and use their existing name-based Nominatim fallback.
- The old negative geocoding cache TTL is reduced from 14 days to 6 hours; successful cache TTL remains 60 days.
- New stops are located using allowlisted IDs only. Invalid/out-of-province IDs do **not** fall back to name matching.
- Editing a stop title clears its previous \`placeId\`. Saving anchored stops requires their IDs to resolve within the exact province and title to match.
- Nothing deletes old plans or changes user/account/database tables.

## Mộc Châu regression scenario

\`scripts/itinerary-map-priority.test.mjs\` tests four named Mộc Châu sites. It passes fake AI titles ("Quán ăn bình dân Mộc Châu") together with allowed IDs, verifies that the resulting plan has all four canonical names, survives a save/load roundtrip, resolves four map pins without Nominatim, and rejects an ID from another province.

The tests simulate the *no-external-geocoding* contract; they do not confirm external API availability or all 34 provinces having enough vetted map records.

## Quality gates

\`\`\`powershell
npm run typecheck
npm run typecheck:api
npm run test:api
npm run build
\`\`\`

**Deployment rule:** branch only. Never merge main or deploy to Vercel before explicit user instruction.

Future follow-ups: expand trusted geocoded catalogs to all 34 provinces; human review of source records/photographs; full browser E2E and route API integration.
