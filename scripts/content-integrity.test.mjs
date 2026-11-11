import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';

const root = process.cwd();
const source = readFileSync(join(root, 'src/data/provincesData.ts'), 'utf8');
const svg = readFileSync(join(root, 'src/imports/vietnam_map_split_new_01_07_(1).svg'), 'utf8');
const names = [...source.matchAll(/^\s*(?:'([^']+)'|([A-Za-z]+)):\s*\{\s*name:\s*'/gm)]
  .map((match) => match[1] ?? match[2]);

test('all 34 province-level units and two island groups are present', () => {
  assert.equal(names.length, 36);
  assert.equal(new Set(names).size, 36);
});

test('every region ID maps to an element in the SVG', () => {
  for (const name of names) {
    assert.ok(svg.includes(`id="${name}"`), `Missing SVG region: ${name}`);
  }
});

test('all province banner paths exist on disk', () => {
  const paths = [...source.matchAll(/banner:\s*'([^']+)'/g)].map((match) => match[1]);
  assert.equal(paths.length, names.length);
  for (const path of paths) {
    assert.ok(existsSync(join(root, 'public', path.replace(/^\//, ''))), `Missing image: ${path}`);
  }
});
