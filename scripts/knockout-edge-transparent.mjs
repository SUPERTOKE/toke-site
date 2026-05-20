/**
 * Remove edge-connected dark / low-chroma pixels (typical black rounded corners, JPEG mislabeled as PNG).
 * Usage: node scripts/knockout-edge-transparent.mjs <input> <output> [--max=52] [--spread=30]
 */
import sharp from 'sharp';
import { renameSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function parseArgs(argv) {
  let maxRgb = 52;
  let maxSpread = 30;
  const paths = [];
  for (const a of argv) {
    if (a.startsWith('--max=')) maxRgb = Number(a.slice(6));
    else if (a.startsWith('--spread=')) maxSpread = Number(a.slice(9));
    else paths.push(a);
  }
  const [inRel, outRel] = paths;
  if (!inRel || !outRel) {
    console.error('Usage: node scripts/knockout-edge-transparent.mjs <input> <output> [--max=N] [--spread=N]');
    process.exit(1);
  }
  const inputPath = join(root, inRel);
  const outputPath = join(root, outRel);
  return { inputPath, outputPath, maxRgb, maxSpread };
}

function walkable(r, g, b, maxRgb, maxSpread) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const spread = mx - mn;
  return mx <= maxRgb && spread <= maxSpread;
}

const { inputPath, outputPath, maxRgb, maxSpread } = parseArgs(process.argv.slice(2));
const tmpPath = `${outputPath}.tmp.png`;

const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) throw new Error(`Expected 4 channels, got ${channels}`);

const visited = new Uint8Array(width * height);
const q = [];

function tryPush(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const i = y * width + x;
  if (visited[i]) return;
  const o = i * 4;
  if (!walkable(data[o], data[o + 1], data[o + 2], maxRgb, maxSpread)) return;
  visited[i] = 1;
  q.push(i);
}

for (let x = 0; x < width; x++) {
  tryPush(x, 0);
  tryPush(x, height - 1);
}
for (let y = 0; y < height; y++) {
  tryPush(0, y);
  tryPush(width - 1, y);
}

for (let qi = 0; qi < q.length; qi++) {
  const i = q[qi];
  const x = i % width;
  const y = (i / width) | 0;
  tryPush(x + 1, y);
  tryPush(x - 1, y);
  tryPush(x, y + 1);
  tryPush(x, y - 1);
}

const out = Buffer.from(data);
for (let i = 0; i < width * height; i++) {
  if (!visited[i]) continue;
  out[i * 4 + 3] = 0;
}

await sharp(out, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9, effort: 9 })
  .toFile(tmpPath);

renameSync(tmpPath, outputPath);
console.log('OK', outputPath, `${width}x${height}`, { maxRgb, maxSpread });
