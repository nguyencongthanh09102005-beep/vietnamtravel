# VietnamTravel — map, travel services, OSM upgrade (14/11/2026)

This is a **source-code branch only**, not a live deployment. Do not merge into main or deploy to Vercel until the owner explicitly requests "đồng bộ Vercel".

## Enhancements

- **Map:** daily route links prefer already-geocoded coordinates for supported stops; unknown stops fall back to name + province. Stops and Google Maps leg ordering remain unchanged. When every eligible stop is geocoded, display total **straight-line (air) distance**, explicitly not driving distance.
- **Travel services / affiliate readiness:** Booking.com, Traveloka, Klook and VeXeRe links in the province details view and AI Planner. These are ordinary external links until a real approved affiliate URL is configured. The UI discloses configured partner links.
- **OSM:** Overpass query separators use real newlines; failure diagnostics now include the server's HTTP error body. OSM data continues to be staged for review and is not published automatically.

## Local QA (Node 22+)

~~~
npm ci
npm run typecheck
npm run typecheck:api
npm run test:api
node --test scripts/local-api.test.mjs
npm run build
~~~

Then run local with LOCAL_CONTENT_AUTORUN=0 and without Turso environment variables. Test Da Nang daily maps, save/reopen plans, province cards and service links.

## Partner URLs

Optional public frontend environment variables:
- VITE_AFFILIATE_BOOKING_URL
- VITE_AFFILIATE_TRAVELOKA_URL
- VITE_AFFILIATE_KLOOK_URL
- VITE_AFFILIATE_VEXERE_URL

Only paste approved public **HTTPS** affiliate tracking links (optionally with {destination}). Do not put secrets in VITE_ variables. No actual affiliate partnership or commission is implied by this code.

## Vercel safety

This branch's vercel.json intentionally sets git.deploymentEnabled=false to prevent **automatic** Git-triggered deployments. **Do not merge that flag into production without separately deciding how future deployments should work.** The production main branch stays unchanged by creating this feature branch. No Vercel API/CLI actions are part of this upgrade.


## Dedicated Dịch vụ tab (2026-11-14)

The province detail panel now has a fifth **Dịch vụ** tab after Tổng quan, Lịch sử, Địa điểm and Ẩm thực. The old panel below every tab and the duplicate AI planner sidebar panel have been removed. All service headings update with the selected province.

- **Di chuyển:** Traveloka flights and VeXeRe coach links. As provider landing pages are not verified location-specific deep links, visitors must choose their departure, destination and dates at the vendor.
- **Lưu trú:** Booking.com search URL pre-fills the chosen province.
- **Trải nghiệm:** Klook opens a verified Hanoi destination page for Hà Nội, or the general Klook portal for other provinces until verified deep links are added.
- **Hoàng Sa/Trường Sa:** Unsupported commercial ticket and hotel booking cards are hidden.
- Booking availability, fares and actual affiliate commission have not been verified.
