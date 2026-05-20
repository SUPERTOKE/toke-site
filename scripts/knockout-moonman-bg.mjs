/**
 * Build a true RGBA PNG from the moonman asset (often mis-tagged .png but JPEG, no alpha).
 * Removes only "background" pixels: dark + low-chroma, 4-connected to any image edge.
 * Keeps saturated dark blues in the visor / art.
 */
import sharp from 'sharp';
import { renameSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const inputPath = join(root, 'src/assets/moonman-head.png');
const outPath = join(root, 'src/assets/moonman-head.png');
const tmpPath = join(root, 'src/assets/moonman-head.png.tmp.png');

function isWalkable(r, g, b) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const spread = mx - mn;
  // Outer black + grey AA; block saturated dark colours (visor blues)
  return mx <= 48 && spread <= 28;
}

const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) {
  throw new Error(`Expected 4 channels after ensureAlpha, got ${channels}`);
}

const visited = new Uint8Array(width * height);
const q = [];

function tryPush(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const i = y * width + x;
  if (visited[i]) return;
  const o = i * 4;
  if (!isWalkable(data[o], data[o + 1], data[o + 2])) return;
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

renameSync(tmpPath, outPath);
console.log('Wrote transparent PNG:', outPath, `${width}x${height}`);
