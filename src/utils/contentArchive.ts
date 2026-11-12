/**
 * Non-destructive archive of the original, manually authored province catalog.
 *
 * Never delete or mutate provinceDetailsData.ts during the migration to a
 * database-backed catalog. The archive is a round-trippable snapshot of every
 * overview, timeline event, place, food item, banner and source citation.
 *
 * Later phases may add researched records, but legacy_manual records must not
 * be overwritten without separately verified evidence and a rollback version.
 */
import { provinceDetailsCatalog, type ProvinceDetailsCatalogItem } from '../data/provinceDetailsData.js';
import { provincesData, type ProvinceId } from '../data/provincesData.js';

export const LEGACY_CONTENT_SOURCE = 'src/data/provinceDetailsData.ts';
export const ARCHIVE_SCHEMA_VERSION = 1;

export type CatalogSection = 'overview' | 'history' | 'places' | 'cuisine';
export type ArchivePayload =
  | { title: string; banner: string; overview: ProvinceDetailsCatalogItem['data']['overview']; administrativeSource?: ProvinceDetailsCatalogItem['administrativeSource'] }
  | ProvinceDetailsCatalogItem['data']['history'][number]
  | ProvinceDetailsCatalogItem['data']['places'][number];

export interface ArchivedContentRecord {
  id: string;
  provinceId: ProvinceId;
  section: CatalogSection;
  position: number;
  origin: 'legacy_manual';
  editorialStatus: 'published';
  sourceFile: typeof LEGACY_CONTENT_SOURCE;
  payload: ArchivePayload;
}

export interface LegacyContentArchive {
  schemaVersion: typeof ARCHIVE_SCHEMA_VERSION;
  source: typeof LEGACY_CONTENT_SOURCE;
  records: ArchivedContentRecord[];
}

function slug(value: string) {
  return value.trim().toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96) || 'entry';
}

/**
 * IDs do not depend on current array positions, so adding an unrelated place
 * does not change previously exported identifiers. Duplicate names retain
 * distinct IDs and are never silently discarded.
 */
export function archiveLegacyCatalog(
  catalog: Record<ProvinceId, ProvinceDetailsCatalogItem> = provinceDetailsCatalog,
): LegacyContentArchive {
  const records: ArchivedContentRecord[] = [];
  for (const provinceId of Object.keys(provincesData) as ProvinceId[]) {
    const province = catalog[provinceId];
    if (!province) throw new Error('Missing legacy province: ' + provinceId);
    const add = (section: CatalogSection, position: number, key: string, payload: ArchivePayload) => {
      const base = ['legacy', slug(provinceId), section, slug(key)].join(':');
      let id = base;
      let counter = 2;
      while (records.some(record => record.id === id)) id = base + ':' + counter++;
      records.push({
        id, provinceId, section, position, origin: 'legacy_manual',
        editorialStatus: 'published', sourceFile: LEGACY_CONTENT_SOURCE, payload,
      });
    };

    add('overview', 0, 'overview', {
      title: province.title,
      banner: province.banner,
      overview: {
        description: province.data.overview.description,
        stats: province.data.overview.stats.map(stat => ({ ...stat })),
      },
      ...(province.administrativeSource
        ? { administrativeSource: { ...province.administrativeSource } } : {}),
    });
    province.data.history.forEach((item, index) =>
      add('history', index, item.year + '-' + item.event, { ...item }));
    province.data.places.forEach((item, index) =>
      add('places', index, item.name, { ...item }));
    province.data.cuisine.forEach((item, index) =>
      add('cuisine', index, item.name, { ...item }));
  }
  return { schemaVersion: ARCHIVE_SCHEMA_VERSION, source: LEGACY_CONTENT_SOURCE, records };
}

export function restoreLegacyCatalog(archive: LegacyContentArchive): Record<ProvinceId, ProvinceDetailsCatalogItem> {
  if (archive.schemaVersion !== ARCHIVE_SCHEMA_VERSION || archive.source !== LEGACY_CONTENT_SOURCE) {
    throw new Error('Unsupported legacy content archive version or source');
  }
  const restored = {} as Record<ProvinceId, ProvinceDetailsCatalogItem>;
  const seen = new Set<string>();
  for (const provinceId of Object.keys(provincesData) as ProvinceId[]) {
    const rows = archive.records.filter(record => record.provinceId === provinceId);
    if (rows.length === 0) throw new Error('Missing province in archive: ' + provinceId);
    for (const row of rows) {
      if (seen.has(row.id)) throw new Error('Duplicate archive record ID: ' + row.id);
      if (row.origin !== 'legacy_manual' || row.editorialStatus !== 'published'
        || row.sourceFile !== LEGACY_CONTENT_SOURCE || row.position < 0
        || !Number.isInteger(row.position)) {
        throw new Error('Invalid legacy archive record: ' + row.id);
      }
      seen.add(row.id);
    }
    const overviewRows = rows.filter(row => row.section === 'overview');
    if (overviewRows.length !== 1) throw new Error('Expected one overview for ' + provinceId);
    const overview = overviewRows[0].payload as Extract<ArchivePayload, { title: string }>;
    const ordered = (section: CatalogSection) =>
      rows.filter(row => row.section === section).sort((a, b) => a.position - b.position);
    restored[provinceId] = {
      title: overview.title,
      banner: overview.banner,
      data: {
        overview: overview.overview,
        history: ordered('history').map(row => row.payload as ProvinceDetailsCatalogItem['data']['history'][number]),
        places: ordered('places').map(row => row.payload as ProvinceDetailsCatalogItem['data']['places'][number]),
        cuisine: ordered('cuisine').map(row => row.payload as ProvinceDetailsCatalogItem['data']['cuisine'][number]),
      },
      ...(overview.administrativeSource
        ? { administrativeSource: overview.administrativeSource } : {}),
    };
  }
  if (seen.size !== archive.records.length) {
    throw new Error('Archive includes records for unknown provinces');
  }
  return restored;
}
