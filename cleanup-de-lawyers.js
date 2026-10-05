// cleanup-de-lawyers.js — remove German-language pages + lawyer profile pages, sanitize references
const fs = require('fs');
const path = require('path');
const SITE = path.join(__dirname, 'site');

// top-level dirs to delete (de/ = whole German section, others = lang="de" posts + lawyer profiles)
const DEL_DIRS = [
  'de',
  'vu-manh-quynh', 'nguyen-hong-giang', 'nguyen-nhuan', 'christine-chou',
  'german-desk-vietnam', 'german-investment-vietnam',
  'arbeitsrecht-hr-compliance-vietnam-deutsche-arbeitgeber',
  'steueraenderungen-2026-vietnam-cfo-leitfaden',
];

// url path segments that no longer exist -> href targets to sanitize
const DEAD = '(de|vu-manh-quynh|nguyen-hong-giang|nguyen-nhuan|christine-chou' +
  '|german-desk-vietnam|german-investment-vietnam' +
  '|arbeitsrecht-hr-compliance-vietnam-deutsche-arbeitgeber' +
  '|steueraenderungen-2026-vietnam-cfo-leitfaden)/';
const DEAD_HREF = `href="(?:\\.\\./)*${DEAD.slice(0, -1)}[^"]*"`; // href="(<../>)*<dead-segment>/..."

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

function cleanHtml(h) {
  // 1) EN/DE language switcher anchors
  h = h.replace(/<a [^>]*lang="de"[^>]*>DE<\/a>/g, '');
  h = h.replace(/<a [^>]*lang="en"[^>]*>EN<\/a>/g, '');
  // 2) German Desk promo section (German-language block)
  h = h.replace(/<section data-screen-label="German Desk"[\s\S]*?<\/section>/g, '');
  // 3) nav/footer "German Desk" text links (target page deleted)
  h = h.replace(/<a href="[^"]*german-desk-vietnam\/index\.html"[^>]*>German Desk<\/a>/g, '');
  // 4) whole card/listing anchors pointing at deleted pages
  const cardRe = new RegExp(`<a\\b(?=[^>]*data-ci-card)[^>]*${DEAD_HREF}[^>]*>[\\s\\S]*?<\\/a>`, 'g');
  h = h.replace(cardRe, '');
  // 5) strip remaining hrefs to deleted targets (keeps visible text, e.g. bylines)
  h = h.replace(new RegExp(` ${DEAD_HREF}`, 'g'), '');
  // 6) leftover language attrs
  h = h.replace(/ (lang|hreflang)="de"/g, '');
  return h;
}

// delete dirs
let removed = 0;
for (const d of DEL_DIRS) {
  const p = path.join(SITE, d);
  if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true }); removed++; }
}

// clean remaining pages
let files = 0;
for (const f of walk(SITE)) {
  const h = fs.readFileSync(f, 'utf8');
  const o = cleanHtml(h);
  if (o !== h) { fs.writeFileSync(f, o, 'utf8'); files++; }
}
console.log({ dirsRemoved: removed, filesCleaned: files });

module.exports = { cleanHtml, DEL_DIRS };
