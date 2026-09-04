import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join(process.cwd(), 'public', 'banner');
const MIN_SIZE = 500 * 1024;
const MAX_DIMENSION = 1800;

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const files = (await walk(ROOT)).filter((file) => /\.(jpe?g|png|webp)$/i.test(file));
let beforeTotal = 0;
let afterTotal = 0;
let changed = 0;

for (const file of files) {
  const stats = await fs.stat(file);
  beforeTotal += stats.size;

  if (stats.size < MIN_SIZE) {
    afterTotal += stats.size;
    continue;
  }

  const extension = path.extname(file).toLowerCase();
  let pipeline = sharp(file)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    });

  if (extension === '.jpg' || extension === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  } else if (extension === '.png') {
    pipeline = pipeline.png({ compressionLevel: 9, quality: 90 });
  } else {
    pipeline = pipeline.webp({ quality: 82, effort: 5 });
  }

  try {
    const output = await pipeline.toBuffer();
    if (output.length < stats.size * 0.95) {
      await fs.writeFile(file, output);
      afterTotal += output.length;
      changed += 1;
      console.log(`${path.basename(file)}: ${formatBytes(stats.size)} -> ${formatBytes(output.length)}`);
    } else {
      afterTotal += stats.size;
    }
  } catch (error) {
    afterTotal += stats.size;
    console.warn(`Skipped ${path.basename(file)}: ${error.message}`);
  }
}

console.log(`Optimized ${changed} image(s).`);
console.log(`Banner assets: ${formatBytes(beforeTotal)} -> ${formatBytes(afterTotal)}.`);
