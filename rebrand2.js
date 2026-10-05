// rebrand2.js — second pass: firm-specific "ECOVIS" leftovers -> Vietoria
// (keeps "ECOVIS International", "ECOVIS network", sister-firm names, etc.)
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

// labels describing the firm itself -> Vietoria
const RULES = [
  [/— ECOVIS<\/title>/g, '— Vietoria</title>'],
  [/ - ECOVIS<\/title>/g, ' - Vietoria</title>'],
  [/— ECOVIS (?=[A-Z])/g, '— Vietoria '],           // title middot "— ECOVIS X"
  [/ECOVIS&hellip;/g, 'Vietoria&hellip;'],
  [/>ECOVIS Solution/g, '>Vietoria Solution'],
  [/#s3-ecovis-solution">ECOVIS Solution/g, '#s3-ecovis-solution">Vietoria Solution'],
  [/ECOVIS Practical Framework/g, 'Vietoria Practical Framework'],
  [/ECOVIS practical framework/g, 'Vietoria practical framework'],
  [/ECOVIS risk-management/g, 'Vietoria risk-management'],
  [/ECOVIS mean by/g, 'Vietoria mean by'],
  [/ECOVIS Advisory Angle/g, 'Vietoria Advisory Angle'],
  [/ECOVIS continuity/g, 'Vietoria continuity'],
  [/ECOVIS client\?/g, 'Vietoria client?'],
  [/ECOVIS clients\?/g, 'Vietoria clients?'],
  [/ECOVIS offices in the issuing/g, 'Vietoria offices in the issuing'],
  [/ECOVIS assist with factory setup/g, 'Vietoria assist with factory setup'],
  [/ECOVIS advise on the commercial/g, 'Vietoria advise on the commercial'],
  [/ECOVIS review a partner/g, 'Vietoria review a partner'],
  [/>ECOVIS can integrate/g, '>Vietoria can integrate'],
  [/>ECOVIS provided/g, '>Vietoria provided'],
  [/ECOVIS attribution on the document/g, 'Vietoria attribution on the document'],
];

let n = 0;
const totals = {};
for (const f of walk(SITE)) {
  let html = fs.readFileSync(f, 'utf8');
  const before = html;
  for (const [re, rep] of RULES) {
    html = html.replace(re, m => { totals[re.source] = (totals[re.source] || 0) + 1; return rep; });
  }
  if (html !== before) { fs.writeFileSync(f, html, 'utf8'); n++; }
}
console.log('files touched:', n);
console.log(totals);
