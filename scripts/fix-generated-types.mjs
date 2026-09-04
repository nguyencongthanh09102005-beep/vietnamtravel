import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'src/data/provinceDetailsData.ts');
let source = fs.readFileSync(file, 'utf8');

source = source.replace(
  'export const provinceDetailsCatalog = {',
  'export const provinceDetailsCatalog: Record<ProvinceId, ProvinceDetailsCatalogItem> = {',
);

source = source.replace(
  '} satisfies Record<ProvinceId, ProvinceDetailsCatalogItem>;',
  '};',
);

fs.writeFileSync(file, source);
