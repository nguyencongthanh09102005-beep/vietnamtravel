# Province map coverage - catalog first

User-visible issue: Mộc Châu succeeded because it had explicitly curated map coordinates; TP. Hồ Chí Minh returned HTTP 422 because the same catalog was empty in the local DB.

Fix: 3 source-referenced named HCMC landmarks, 2 Hanoi landmarks, 1 Da Nang landmark are included in the reviewed coordinate list. Other province catalogs can now use an on-demand, source-checked Wikipedia article coordinate bootstrap, rather than accepting fake AI-provided place names.

Safeguards: Wikipedia requests are triggered only during planner generation when fewer than 2 verified points exist, never on autocomplete, tiles, cron or every geocoding attempt. One batched exact-title request per province per day; logged errors can retry 15 minutes later. Only exact editorial catalog landmark names with a coordinate-bearing article whose intro mentions the correct current or merged province are inserted in the additive `travel_wikipedia_geodata` table. User itineraries and source editorial content remain unchanged.

Existing `placeId` authority, schema v1 saved-plan compatibility, OSM published gating and no-guess/no-fake-coordinate rules are preserved. Validating all 34 provinces requires verifying external source coverage; a province without qualified landmarks still returns a precise HTTP 422 rather than fictional pins.

Test with three-day, five-person, 10,000,000 VND nature itinerary for HCMC, then create fresh plans for Hanoi, Da Nang and a non-curated province. Existing saved plans are not rewritten.

Commands: `npm run typecheck`, `npm run typecheck:api`, `npm run test:api`, `npm run build`.

Deployment: feature branch only. No main or Vercel synchronization.