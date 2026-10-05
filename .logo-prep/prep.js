const sharp = require('sharp');
const SRC = '../logo.jpeg';
const OUT = '../site/assets/img/';

// key out the white background: alpha = 255 - min(r,g,b), un-blend colour
async function keyWhite(sharpImg) {
  const { data, info } = await sharpImg.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.from(data);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const m = Math.min(r, g, b);
    const a = 255 - m;
    px[i + 3] = a;
    if (a > 0) {
      px[i] = Math.round((r - m) * 255 / (255 - m));
      px[i + 1] = Math.round((g - m) * 255 / (255 - m));
      px[i + 2] = Math.round((b - m) * 255 / (255 - m));
    } else { px[i] = px[i + 1] = px[i + 2] = 0; }
  }
  return sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } });
}

(async () => {
  const meta = await sharp(SRC).metadata();
  const W = meta.width, H = meta.height;

  // emblem: V + globe + arrow (upper portion only — stop above "VIETORIA" text)
  const emblem = await (await keyWhite(
    sharp(SRC).extract({ left: Math.round(0.18 * W), top: Math.round(0.10 * H), width: Math.round(0.66 * W), height: Math.round(0.38 * H) })
  )).trim({ threshold: 12 }).png().toBuffer();

  // wordmark: "VIETORIA" band only (exclude "BUSINESS SERVICES" tagline below)
  const wordmark = await (await keyWhite(
    sharp(SRC).extract({ left: Math.round(0.03 * W), top: Math.round(0.52 * H), width: Math.round(0.94 * W), height: Math.round(0.12 * H) })
  )).trim({ threshold: 12 }).png().toBuffer();

  // save standalone emblem (favicon, footer)
  await sharp(emblem).png().toFile(OUT + 'vietoria-mark.png');

  // horizontal lockup: emblem | wordmark
  const embH = 320;
  const embBuf = await sharp(emblem).resize({ height: embH }).toBuffer();
  const embMeta = await sharp(embBuf).metadata();
  const wmH = Math.round(embH * 0.52);
  const wmBuf = await sharp(wordmark).resize({ height: wmH }).toBuffer();
  const wmMeta = await sharp(wmBuf).metadata();
  const gap = 28;
  const lockup = await sharp({
    create: { width: embMeta.width + gap + wmMeta.width, height: embH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([
    { input: embBuf, left: 0, top: 0 },
    { input: wmBuf, left: embMeta.width + gap, top: Math.round((embH - wmH) / 2) },
  ]).png().toBuffer();
  await sharp(lockup).png().toFile(OUT + 'vietoria-logo.png');

  const m1 = await sharp(OUT + 'vietoria-mark.png').metadata();
  const m2 = await sharp(OUT + 'vietoria-logo.png').metadata();
  console.log('mark:', m1.width + 'x' + m1.height, '| logo:', m2.width + 'x' + m2.height);
})();
