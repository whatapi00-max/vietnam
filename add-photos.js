// add-photos.js — place the 5 TTH-branded photos across the site.
const fs = require('fs'), path = require('path');
const ROOT = __dirname, SITE = path.join(ROOT, 'site');
const IMG = path.join(SITE, 'assets', 'img');

// 1) copy & rename
const MAP = [
  ['WhatsApp Image 2026-10-15 at 5.26.03 PM.jpeg',      'tth-consultation.jpeg'],
  ['WhatsApp Image 2026-10-15 at 5.26.03 PM (1).jpeg',  'tth-establish-dissolve.jpeg'],
  ['WhatsApp Image 2026-10-15 at 5.26.03 PM (2).jpeg',  'tth-investment-flyer.jpeg'],
  ['WhatsApp Image 2026-10-15 at 5.26.04 PM.jpeg',      'tth-tax-desk.jpeg'],
  ['WhatsApp Image 2026-10-15 at 5.26.04 PM (1).jpeg',  'tth-solutions-flyer.jpeg'],
];
for (const [src, dst] of MAP) {
  const s = path.join(ROOT, src);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(IMG, dst));
}

function banner(rel, img, alt) {
  return `
  <section data-screen-label="Photo" style="max-width:1200px;margin:0 auto;padding:8px 24px 0">
    <img src="${rel}assets/img/${img}" alt="${alt}" loading="lazy" style="display:block;width:100%;height:auto;max-height:480px;object-fit:cover;border-radius:24px;box-shadow:0 24px 48px -20px rgba(11,46,51,.30)">
  </section>`;
}

function insertAfterPagehead(file, rel, img, alt) {
  const p = path.join(SITE, file);
  let h = fs.readFileSync(p, 'utf8');
  if (h.includes('data-screen-label="Photo"')) return false;
  const i = h.indexOf('data-screen-label="Pagehead"');
  if (i === -1) return false;
  const end = h.indexOf('</section>', i);
  if (end === -1) return false;
  h = h.slice(0, end + 10) + banner(rel, img, alt) + h.slice(end + 10);
  fs.writeFileSync(p, h);
  return true;
}

// 2) homepage hero -> consultation photo
const hp = path.join(SITE, 'index.html');
let h = fs.readFileSync(hp, 'utf8');
h = h.replace(
  /src="assets\/img\/hero-hcmc-thu-thiem-2030-web\.jpg"[^>]*alt="[^"]*"/,
  'src="assets/img/tth-consultation.jpeg" alt="TTH advisory session overlooking the Ho Chi Minh City skyline"'
);
h = h.replace(/Thủ Thiêm · District 1 · 2030 masterplan/, 'Advisory session · Ho Chi Minh City');
fs.writeFileSync(hp, h);

// 3) service detail pages -> matched flyers/photos
insertAfterPagehead('services/fdi-market-entry-vietnam/index.html', '../../',
  'tth-investment-flyer.jpeg', 'TTH Business Services — business law and Vietnam investment support');
insertAfterPagehead('services/corporate-transactions-vietnam/index.html', '../../',
  'tth-establish-dissolve.jpeg', 'TTH Business Services — company establishment and dissolution in Vietnam');
insertAfterPagehead('services/operational-compliance-vietnam/index.html', '../../',
  'tth-tax-desk.jpeg', 'TTH Business Services — accounting and tax filing desk');

// 4) contact page -> solutions flyer
insertAfterPagehead('contact/index.html', '../',
  'tth-solutions-flyer.jpeg', 'TTH Business Services — professional legal solutions for business and investment in Vietnam');

console.log('photos placed');
