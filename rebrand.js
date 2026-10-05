// rebrand.js — swaps ECOVIS branding for Vietoria across all generated pages
const fs = require('fs');
const path = require('path');
const SITE = path.join(__dirname, 'site');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

let n = 0, counts = {};
function rebrand(html) {

  // favicon -> emblem mark
  html = html.replace(/(rel="icon"[^>]*href="(?:\.\.\/)*assets\/img\/)ecovis-logo-red\.png/g,
    (m, p) => { counts['favicon'] = (counts['favicon'] || 0) + 1; return `${p}vietoria-mark.png`; });

  // header logo img -> horizontal lockup, taller for legibility
  html = html.replace(/<img src="((?:\.\.\/)*assets\/img\/)ecovis-logo-red\.png"[^>]*>/g,
    (m, p) => { counts['hdr-logo'] = (counts['hdr-logo'] || 0) + 1;
      return `<img src="${p}vietoria-logo.png" alt="Vietoria" style="height:40px;width:auto;display:block">`; });

  // header wordmark "Vietnam Law" next to logo -> drop (lockup carries the name)
  html = html.replace(/<span style="font-size:19px;font-weight:400;color:#6B6E6F;padding-left:14px;border-left:1px solid #E3E3E5;white-space:nowrap">Vietnam Law<\/span>/g,
    () => { counts['hdr-wordmark'] = (counts['hdr-wordmark'] || 0) + 1; return ''; });

  // footer logo img -> lockup inside a white chip (legible on magenta)
  html = html.replace(/<img src="((?:\.\.\/)*assets\/img\/)ecovis-logo-white\.png"[^>]*>/g,
    (m, p) => { counts['ftr-logo'] = (counts['ftr-logo'] || 0) + 1;
      return `<span style="display:inline-flex;background:#fff;border-radius:4px;padding:9px 14px"><img src="${p}vietoria-logo.png" alt="Vietoria" style="height:30px;width:auto;display:block"></span>`; });

  // footer wordmark "Vietnam Law" -> drop
  html = html.replace(/<span style="font-size:16px;font-weight:400;color:rgba\(255,255,255,\.9\);padding-left:12px;border-left:1px solid rgba\(255,255,255,\.28\);white-space:nowrap">Vietnam Law<\/span>/g,
    () => { counts['ftr-wordmark'] = (counts['ftr-wordmark'] || 0) + 1; return ''; });

  // firm-name text replacements (order matters; keep ECOVIS International/network refs)
  html = html.replace(/ECOVIS Vietnam Law/g, 'Vietoria');
  html = html.replace(/ECOVIS Vietnam/g, 'Vietoria');
  html = html.replace(/ECOVIS in Vietnam/g, 'Vietoria in Vietnam');
  html = html.replace(/alt="ECOVIS"/g, 'alt="Vietoria"');
  return html;
}

for (const f of walk(SITE)) {
  const html = fs.readFileSync(f, 'utf8');
  const out = rebrand(html);
  if (out !== html) { fs.writeFileSync(f, out, 'utf8'); n++; }
}
console.log('updated files:', n);
console.log(counts);
// leftover ECOVIS references (excluding International / network / lowercase urls)
const leftovers = {};
for (const f of walk(SITE)) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/[^a-z]ECOVIS[^<"]{0,40}/g)) {
    const s = m[0];
    if (/International|network/i.test(s)) continue;
    leftovers[s.trim().slice(0, 50)] = (leftovers[s.trim().slice(0, 50)] || 0) + 1;
  }
}
console.log('leftover ECOVIS refs:', leftovers);
