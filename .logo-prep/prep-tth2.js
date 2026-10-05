// TTH logo prep v2 — hard black-threshold keying so letters stay OPAQUE on white
const sharp = require('sharp');
const path = require('path');
const SRC = 'logo og.jpeg';
const OUT = 'site/assets/img';

(async () => {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.2126*data[i] + 0.7152*data[i+1] + 0.0722*data[i+2];
    // opaque above 70, transparent below 28, soft ramp between
    const a = lum <= 28 ? 0 : lum >= 70 ? 255 : Math.round((lum - 28) / 42 * 255);
    px[i]=data[i]; px[i+1]=data[i+1]; px[i+2]=data[i+2]; px[i+3]=a;
  }
  const keyed = await sharp(Buffer.from(px), { raw: { width: info.width, height: info.height, channels: 4 } })
    .png().trim().toBuffer();
  await sharp(keyed).resize({ height: 512 }).png().toFile(path.join(OUT, 'tth-mark.png'));
  await sharp(keyed).resize({ height: 556 }).png().toFile(path.join(OUT, 'tth-logo.png'));
  const m = await sharp(keyed).metadata();
  console.log('trimmed', m.width, 'x', m.height);
  // report alpha distribution
  const { data: d2, info: i2 } = await sharp(keyed).raw().toBuffer({ resolveWithObject: true });
  let op=0, tr=0, semi=0;
  for (let i=3;i<d2.length;i+=4){ if(d2[i]>200)op++; else if(d2[i]<40)tr++; else semi++; }
  console.log({ opaque: op, transparent: tr, semi });
  // debug: flattened on white
  await sharp(keyed).flatten({ background: '#ffffff' }).resize({ height: 120 }).jpeg().toFile('.logo-prep/tth-on-white.jpg');
})();
