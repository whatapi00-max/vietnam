// redesign.js — full visual restyle: petrol/teal + gold palette, serif display
// headings, pill buttons, rounded cards, new homepage hero. Content unchanged.
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, 'site');

const htmlFiles = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) htmlFiles.push(p);
  }
})(SITE);

/* ---------- palette: navy corporate -> petrol/teal + brass ---------- */
const COLOR_MAP = [
  ['#10264A', '#0B2E33'],
  ['#1F3B68', '#17545E'],
  ['#2F5A94', '#2E8B93'],
  ['#142F7E', '#17545E'],
  ['#F0F4FA', '#EDF5F3'],
  ['#F0F4FF', '#EDF5F3'],
  ['#383A3B', '#2E3A3B'],
  ['#6B6E6F', '#5C6567'],
  ['#5A5C5D', '#566063'],
  ['#5B5D5F', '#556064'],
  ['#4A4C4D', '#475354'],
  ['#E6E2D6', '#E3E0D3'],
  ['#DAD6C8', '#D6D2C5'],
  ['#F3F1E8', '#F4F1EA'],
  ['#F9F9F9', '#F8F7F2'],
  ['#F5F5F5', '#F4F3EE'],
  ['#E0E0E0', '#DCE1DE'],
  ['rgba(56,58,59', 'rgba(28,45,48'],
  ['rgba(12,26,50', 'rgba(11,46,51'],
  ['rgba(31,59,104', 'rgba(23,84,94'],
  ['background:#0A0A0A', 'background:#fff'], // footer logo chip -> white
];
// theme.css keeps lowercase attrs with same values; apply map to it too.
const cssTargets = [path.join(SITE, 'assets/css/theme.css')];

function applyColorMap(t) {
  for (const [a, b] of COLOR_MAP) t = t.split(a).join(b);
  return t;
}

/* ---------- shape: square -> rounded ---------- */
function applyRadii(t) {
  t = t.replace(/border-radius:0 4px 4px 0/g, 'border-radius:0 10px 10px 0');
  t = t.replace(/border-radius:2px/g, 'border-radius:16px');
  t = t.replace(/border-radius:4px/g, 'border-radius:10px');
  t = t.replace(/border-radius:6px/g, 'border-radius:12px');
  t = t.replace(/border-radius:3px/g, 'border-radius:8px');
  // kicker dash: flat 3px bar -> rounded 4px pill
  t = t.replace(/width:(\d+)px;height:3px;(flex:0 0 \d+px;)/g, 'width:$1px;height:4px;$2border-radius:99px;');
  // pill buttons: inline-flex CTAs with button paddings
  t = t.replace(/(style="[^"]*display:inline-flex[^"]*padding:(?:14px 24px|13px 22px|9px 16px|8px 24px)[^"]*?)border-radius:16px/g, '$1border-radius:999px');
  // footer mosaic strip -> rounded bar
  t = t.replace(/(display:flex;height:6px;max-width:1200px;margin:0 auto 40px)/g, '$1;border-radius:99px;overflow:hidden');
  return t;
}

/* ---------- homepage hero: full-bleed dark -> light split layout ---------- */
const NEW_HERO = `<section data-screen-label="Hero" data-ci-hero-box style="position:relative;isolation:isolate;background:#F4F1EA;overflow:hidden">
    <div aria-hidden="true" style="position:absolute;right:-180px;top:-180px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,#DCEBE8 0%,rgba(220,235,232,0) 70%)"></div>
    <div data-ci-hero-grid style="position:relative;max-width:1200px;margin:0 auto;padding:104px 24px 96px;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,.98fr);gap:60px;align-items:center">
      <div>
        <p style="display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#17545E;margin-bottom:18px">
          <span style="width:26px;height:4px;flex:0 0 26px;border-radius:99px;background:#D2A051"></span>TTH in Vietnam · Ho Chi Minh City
        </p>
        <h1 style="font-size:56px;line-height:1.12;font-weight:600;letter-spacing:-.01em;color:#0B2E33;max-width:20ch;text-wrap:balance">Vietnam legal counsel <span style="font-family:'Noto Serif',Georgia,serif;font-style:italic;color:#17545E">for</span> foreign investors and manufacturers</h1>
        <p data-ci-hero-lead style="font-size:20px;line-height:1.55;color:#5C6567;max-width:54ch;margin-top:22px;text-wrap:pretty">Legal, tax and advisory services for foreign investors and businesses entering and operating in Vietnam.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:34px">
          <a href="contact/index.html" style="display:inline-flex;align-items:center;padding:14px 26px;background:#D2A051;color:#0B2E33;text-decoration:none;font-size:16px;font-weight:600;border-radius:999px" data-hv="hv0">Request a consultation</a>
          <a href="about/index.html" style="display:inline-flex;align-items:center;padding:14px 26px;background:#fff;color:#17545E;text-decoration:none;font-size:16px;font-weight:600;border-radius:999px;border:1px solid #D6D2C5" data-hv="hv4">See how we work</a>
        </div>
        <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 28px;margin-top:40px;padding-top:20px;border-top:1px solid rgba(23,84,94,.15);font-size:15px;color:#5C6567">
          <span style="display:inline-flex;align-items:center;gap:8px"><span style="width:6px;height:6px;border-radius:50%;background:#D2A051"></span>FDI &amp; market entry</span>
          <span style="display:inline-flex;align-items:center;gap:8px"><span style="width:6px;height:6px;border-radius:50%;background:#D2A051"></span>Accounting &amp; tax</span>
          <span style="display:inline-flex;align-items:center;gap:8px"><span style="width:6px;height:6px;border-radius:50%;background:#D2A051"></span>M&amp;A transactions</span>
        </div>
      </div>
      <div style="position:relative">
        <div aria-hidden="true" style="position:absolute;right:-18px;bottom:-18px;width:70%;height:70%;border-radius:28px;background:#17545E;opacity:.14"></div>
        <picture><img src="assets/img/hero-hcmc-thu-thiem-2030-web.jpg" width="1500" height="900" alt="Ho Chi Minh City looking towards the Thu Thiem financial district across the Saigon River — artist&#039;s impression of the 2030 masterplan" fetchpriority="high" decoding="sync" style="position:relative;width:100%;height:auto;aspect-ratio:5/4.4;object-fit:cover;object-position:58% 46%;border-radius:24px;box-shadow:0 32px 64px -24px rgba(11,46,51,.35)" data-eio="p"></picture>
        <p style="position:absolute;left:16px;bottom:16px;margin:0;padding:8px 14px;border-radius:99px;background:rgba(255,255,255,.92);font-size:13px;letter-spacing:.02em;color:#17545E;backdrop-filter:blur(4px)">Thủ Thiêm · District 1 · 2030 masterplan</p>
      </div>
    </div>
  </section>`;

function applyHero(t) {
  const i = t.indexOf('data-ci-hero-box');
  if (i === -1) return t;
  const secStart = t.lastIndexOf('<section', i);
  const secEnd = t.indexOf('</section>', i);
  if (secStart === -1 || secEnd === -1) return t;
  return t.slice(0, secStart) + NEW_HERO + t.slice(secEnd + '</section>'.length);
}

/* ---------- run ---------- */
let changed = 0;
for (const f of htmlFiles) {
  let h = fs.readFileSync(f, 'utf8');
  let orig = h;
  h = applyColorMap(h);
  h = applyRadii(h);
  if (path.basename(f) === 'index.html' && path.dirname(f) === SITE) h = applyHero(h);
  if (h !== orig) { fs.writeFileSync(f, h); changed++; }
}

for (const cf of cssTargets) {
  let c = fs.readFileSync(cf, 'utf8');
  c = applyColorMap(c);
  // new design-system rules appended (idempotent)
  if (!c.includes('redesign pass: editorial petrol theme')) c += `
/* ---- redesign pass: editorial petrol theme ---- */
body{background:#F7F5EF}
h1,h2{font-family:'Noto Serif',Georgia,'Times New Roman',serif !important;font-weight:600 !important}
[data-ci-card]{box-shadow:0 2px 16px -6px rgba(11,46,51,.10)}
[data-ci-card]:hover{box-shadow:0 10px 32px -12px rgba(11,46,51,.20)}
@media (max-width:960px){[data-ci-hero-grid]{grid-template-columns:minmax(0,1fr) !important;gap:44px !important;padding:72px 24px 64px !important}}
@media (max-width:560px){[data-ci-hero-box] h1{font-size:34px !important}}
`;
  fs.writeFileSync(cf, c);
}

console.log('redesigned', changed, 'html files + theme.css');
