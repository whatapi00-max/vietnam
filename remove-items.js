// remove-items.js — removes the 3 named list items from site/index.html
const fs = require('fs');
const FILE = 'site/index.html';
const ITEMS = [
  'Data Protection &amp; Cybersecurity',
  'Intellectual Property',
  'Compliance &amp; Internal Investigations',
];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let h = fs.readFileSync(FILE, 'utf8');
let removed = 0;
for (const t of ITEMS) {
  const re = new RegExp(
    '\\s*<span style="display:flex;align-items:baseline[^"]*">\\s*' +
    '<span aria-hidden="true"[^>]*></span>' +
    '<a [^>]*>' + esc(t) + '</a>\\s*</span>', 'g');
  const n = (h.match(re) || []).length;
  h = h.replace(re, '');
  removed += n;
}
fs.writeFileSync(FILE, h, 'utf8');
console.log('removed:', removed);
console.log('remaining hits:', (h.match(/Data Protection|Intellectual Property|Internal Investigations/g) || []).length);
