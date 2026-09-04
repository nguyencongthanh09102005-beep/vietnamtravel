import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const candidates = [
  'src/data/provinceDetailsData.ts',
  'src/app/components/ProvinceDetails.tsx',
  'src/app/App.tsx',
];

const missing = new Set();
const referenced = new Set();

for (const relativeFile of candidates) {
  const file = path.join(root, relativeFile);
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/["'](\/banner\/[^"']+)["']/g)) {
    referenced.add(match[1]);
  }
}

for (const asset of referenced) {
  const file = path.join(root, 'public', asset.replace(/^\//, ''));
  if (!fs.existsSync(file)) missing.add(asset);
}

if (missing.size > 0) {
  console.error('Missing referenced image assets:');
  for (const asset of [...missing].sort()) console.error(` - ${asset}`);
  process.exit(1);
}

console.log(`Validated ${referenced.size} referenced banner assets.`);
