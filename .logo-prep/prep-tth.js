// prep-tth.js — TTH logo on black bg -> transparent PNGs
const sharp = require('sharp');
const path = require('path');
const SRC = path.join(__dirname, '..', 'logo og.jpeg');
const OUT = p => path.join(__dirname, '..', 'site', 'assets', 'img', p);

async function main() {
  // raw RGB
  const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(data.length / 3 * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    px[j] = r; px[j + 1] = g; px[j + 2] = b;
    px[j + 3] = Math.max(r, g, b); // luminance key: black -> 0 alpha
  }
  const keyed = sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } });

  const trimmed = await keyed.png().toBuffer();
  const meta = await sharp(trimmed).trim({ threshold: 8 }).toBuffer().then(b => sharp(b).metadata());
  const tight = await sharp(trimmed).trim({ threshold: 8 }).png().toBuffer();

  // mark (favicon) — square-ish, padded slightly
  await sharp(tight).resize({ width: 512 }).png().toFile(OUT('tth-mark.png'));
  // logo (header/footer) — same mark, taller export
  await sharp(tight).resize({ width: 1024 }).png().toFile(OUT('tth-logo.png'));

  const m1 = await sharp(OUT('tth-mark.png')).metadata();
  const m2 = await sharp(OUT('tth-logo.png')).metadata();
  console.log('mark:', m1.width + 'x' + m1.height, ' logo:', m2.width + 'x' + m2.height);
}
main().catch(e => { console.error(e); process.exit(1); });
