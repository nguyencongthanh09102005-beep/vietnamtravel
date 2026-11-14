# Tourism information and licensed image pipeline (feature branch)

## What was fixed

1. **No fake broken-image graphics.** \`ImageWithFallback\` uses a Lucide vector icon. Missing src shows "Chưa có ảnh xác minh"; a real browser onError shows "Ảnh tạm thời không tải được". Thumbnail placeholders use place/food-specific icons.
2. **Regional cuisine is not assumed unique.** Detail cards say "gợi ý ẩm thực" and explain that listing a dish for a province is **not proof of regional origin or exclusivity**. Cards without linked local evidence warn clearly.
3. **Stricter automated regional evidence.** Even when the article intro mentions a province, a generic recipe is not auto-approved unless Wikidata description or encyclopedia categories also identify the province. Previously published auto_v2 cuisine is rechecked when the public API assembles cards, so existing questionable entries can be withheld without deleting their database versions.
4. **Image provenance visible.** Where metadata exists, the detail overlay shows image credit and a link to its image license/source separately from the article text source. Existing legacy images remain visible, but uncredited images are labeled as lacking recorded rights metadata. This is not proof of infringement.
5. **Openverse is an optional discovery source**, **NOT** an automatic publisher. Only CC0 / CC BY / CC BY-SA results from allowlisted Commons/Flickr image hosts with matching source pages, adequate size and creator metadata become **pending** candidates. Real usage must check subject identity and current source license before approval. The basic Commons/Flickr queue remains unchanged.

## Run against local SQLite ONLY

\`\`\`powershell
npm run catalog:media-audit
npm run catalog:image-queue -- --max=10 --openverse
npm run catalog:image-review
\`\`\`

**Audit** lists, for each of the 34 official provinces: place/food counts, images missing, image records with no attribution/link, food records with no source URL, and pending image queue size. Does not check if remote URLs are online.

**Queue** only prepares potential photos to be reviewed. Openverse queries use its official image search API at \`api.openverse.org/v1/images/\`, do not crawl sites, and are enabled only when \`--openverse\` is supplied. Existing script safety stops prevent running review/queue operations against remote Turso or Vercel.

**Review** displays candidate URLs and licenses for an authorized human to inspect before using \`--approve=<id>\` or \`--reject=<id>\`. Search result and license metadata are not sufficient to establish that an image actually shows the correct local dish or venue.

## Remaining work

- A confirmed, province-specific second editorial source is still needed for a **"verified local specialty"** label; Wikipedia categories and Wikidata belong to the same linked ecosystem and alone do not establish independence.
- Manually audit legacy local images and missing rights credits; no automatic deletion.
- Audit published source candidates for historical province attribution and cross-regional food listings.
- Review and repair images in the LOCAL queue before deciding how to synchronize approved data. No automatic Vercel deployment.

All changes stay on \`feature/vietnamtravel-map-affiliate-osm-20261114\`.
