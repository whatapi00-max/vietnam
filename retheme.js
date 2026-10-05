// retheme.js — ECOVIS magenta -> Vietoria navy/gold across all pages + theme.css
const fs = require('fs');
const path = require('path');
const SITE = path.join(__dirname, 'site');

const NAVY_DEEP = '#10264A', NAVY = '#1F3B68', STEEL = '#2F5A94';
const GOLD_DARK = '#B08A2E', GOLD = '#D2A051';
const WARM_BG = '#F3F1E8', WARM_BG2 = '#F6F4ED', WARM_BG3 = '#F7F5EF';
const WARM_BORDER = '#E6E2D6', WARM_BORDER2 = '#DAD6C8', WARM_BORDER3 = '#BBB7A9';

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(html|css)$/.test(e.name)) yield p;
  }
}

const totals = {};
function rep(html, re, to, key) {
  return html.replace(re, m => { totals[key] = (totals[key] || 0) + 1; return to; });
}

function retheme(html) {
  // 1) full gradient sequences first (order matters: navy -> gold sweep)
  html = rep(html,
    /linear-gradient\((\d+deg),#C6093B,#CD1437,#B41446,#A71645,#8C0550\)/gi,
    `linear-gradient($1,${NAVY_DEEP},${NAVY},${STEEL},${GOLD_DARK},${GOLD})`, 'gradient5');
  // footer mosaic: 5 span strip
  html = rep(html,
    /background:#C6093B([^>]*><\/span><span style="flex:1;background:)#CD1437([^>]*><\/span><span style="flex:1;background:)#B41446([^>]*><\/span><span style="flex:1;background:)#A71645([^>]*><\/span><span style="flex:1;background:)#8C0550/gi,
    `background:${NAVY_DEEP}$1${NAVY}$2${STEEL}$3${GOLD_DARK}$4${GOLD}`, 'mosaic5');
  // hero left bar: 4 span strip
  html = rep(html,
    /background:#C6093B([^>]*><\/span><span style="flex:1;background:)#B41446([^>]*><\/span><span style="flex:1;background:)#A71645([^>]*><\/span><span style="flex:1;background:)#8C0550/gi,
    `background:${NAVY_DEEP}$1${NAVY}$2${GOLD_DARK}$3${GOLD}`, 'mosaic4');

  // 2) rgba families
  html = rep(html, /46,6,28/g, '12,26,50', 'rgba-dark');   // hero overlay
  html = rep(html, /198,9,59/g, '31,59,104', 'rgba-navy'); // rings/shadows

  // 3) per-color leftovers (case-insensitive)
  html = rep(html, /#C6093B/gi, NAVY, 'primary');
  html = rep(html, /#8C0550/gi, NAVY_DEEP, 'dark');
  html = rep(html, /#CD1437/gi, STEEL, 'cd1437');
  html = rep(html, /#CD1432/gi, STEEL, 'cd1432');
  html = rep(html, /#B41446/gi, GOLD_DARK, 'b41446');
  html = rep(html, /#A71645/gi, GOLD, 'a71645');

  // 4) neutrals -> warm tint (logo-friendly)
  html = rep(html, /#EAEBED/gi, WARM_BG, 'eaebed');
  html = rep(html, /#F6F6F7/gi, WARM_BG2, 'f6f6f7');
  html = rep(html, /#F7F7F8/gi, WARM_BG3, 'f7f7f8');
  html = rep(html, /#FFF9F9/gi, '#F8F6F0', 'fff9f9');
  html = rep(html, /#FFF3F5/gi, '#F0F4FA', 'fff3f5');
  html = rep(html, /#E3E3E5/gi, WARM_BORDER, 'e3e3e5');
  html = rep(html, /#D8D9DB/gi, WARM_BORDER2, 'd8d9db');
  html = rep(html, /#B9BBBD/gi, WARM_BORDER3, 'b9bbbd');
  return html;
}

let n = 0;
for (const f of walk(SITE)) {
  const html = fs.readFileSync(f, 'utf8');
  const out = retheme(html);
  if (out !== html) { fs.writeFileSync(f, out, 'utf8'); n++; }
}
console.log('files updated:', n);
console.log(totals);
