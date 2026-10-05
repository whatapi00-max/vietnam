// mirror.js — builds a fully static, scriptless mirror of ecovislaw.vn
// Output: site/<path>/index.html + site/assets/{img,files,css}
// No JavaScript anywhere; internal links rewritten to local pages.
const fs = require('fs');
const path = require('path');

const BASE = 'https://ecovislaw.vn';
const OUT = path.join(__dirname, 'site');
const CONCURRENCY = 6;
const MAX_PAGES = 500;
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) static-mirror' };

const IMG_EXT = /\.(jpe?g|png|webp|gif|svg|avif|ico)$/i;
const FILE_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|csv|txt)$/i;

const queue = [];            // normalized page URLs to fetch
const queued = new Set();    // normalized URLs already queued
const fetched = new Set();   // normalized URLs fetched (ok)
const failed = new Set();
const imgMap = new Map();    // remote URL -> local filename
const fileMap = new Map();
const pages = new Map();     // normalized URL -> {path, lang, title, desc, body}

function normPage(u) {
  try {
    const x = new URL(u, BASE);
    if (x.origin !== BASE) return null;
    let p = x.pathname.replace(/\/+$/, '');
    if (p === '') p = '/'; else p += '/';
    return x.origin + p;
  } catch { return null; }
}

function enqueue(u) {
  const n = normPage(u);
  if (!n || queued.has(n) || queued.size >= MAX_PAGES) return;
  // skip non-page endpoints
  if (/\/wp-(admin|json|includes|login)|xmlrpc|\/feed\/|\?/.test(n)) return;
  // skip German-language section and lawyer profile pages (removed from mirror)
  if (/\/de\/|\/(vu-manh-quynh|nguyen-hong-giang|nguyen-nhuan|christine-chou|german-desk-vietnam|german-investment-vietnam|arbeitsrecht-hr-compliance-vietnam-deutsche-arbeitgeber|steueraenderungen-2026-vietnam-cfo-leitfaden)\//.test(n)) return;
  queued.add(n);
  queue.push(n);
}

async function get(url, type = 'text') {
  const r = await fetch(url, { headers: UA, redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return type === 'text' ? r.text() : Buffer.from(await r.arrayBuffer());
}

function localName(map, url, dir) {
  if (map.has(url)) return `${dir}/${map.get(url)}`;
  let base = decodeURIComponent(path.posix.basename(new URL(url).pathname));
  base = base.replace(/[^\w.\-]+/g, '-');
  // collision-safe filename
  const taken = new Set(map.values());
  let name = base, i = 1;
  while (taken.has(name)) name = `${i++}-${base}`;
  map.set(url, name);
  return `${dir}/${name}`;
}

// ---------------- HTML transform ----------------

const NAV_TOGGLE = `<input type="checkbox" id="ev-nav-check" aria-label="Menu">
    <label for="ev-nav-check" data-ci-nav-toggle="" aria-label="Menu" style="display:none;align-items:center;justify-content:center;width:40px;height:40px;padding:0;background:none;border:1px solid #E3E3E5;border-radius:2px;cursor:pointer;flex:0 0 auto">
      <svg data-ci-nav-icon-open="" width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true"><path d="M0 1h18M0 7h18M0 13h18" stroke="#383A3B" stroke-width="1.5"/></svg>
      <svg data-ci-nav-icon-close="" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style="display:none"><path d="M1 1l14 14M15 1L1 15" stroke="#383A3B" stroke-width="1.5"/></svg>
    </label>`;

function localAsset(url) {
  if (IMG_EXT.test(new URL(url).pathname)) return '/assets/img/' + localName(imgMap, url, 'x').slice(2);
  if (FILE_EXT.test(new URL(url).pathname)) return '/assets/files/' + localName(fileMap, url, 'x').slice(2);
  return null;
}

function rewriteHref(href) {
  if (!href || href.startsWith('#')) return href;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return href;
  let u;
  try { u = new URL(href, BASE); } catch { return '#!'; }
  if (u.origin !== BASE) return href;                       // external — keep real
  const p = u.pathname;
  if (/\/wp-(admin|json|includes|login)|xmlrpc|\.php|\/feed\//i.test(p)) return '#!';
  const asset = localAsset(u.href);
  if (asset) return asset + u.hash;                          // downloadable file / image
  if (u.search) return '#!';                                 // query endpoints (search etc.)
  enqueue(u.href);                                           // queue internal page
  const n = normPage(u.href);
  const pagePath = new URL(n).pathname;                      // e.g. /about/ or /
  return (pagePath === '/' ? '/index.html' : pagePath + 'index.html') + u.hash;
}

function transformBody(src) {
  let body;
  const bs = src.indexOf('<body');
  const be = src.indexOf('>', bs) + 1;
  const fe = src.indexOf('</footer>');
  body = fe > bs ? src.slice(be, fe + 9) : src.slice(be, src.indexOf('</body>'));

  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<script\b[^>]*\/>/gi, '');
  body = body.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');
  body = body.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
  body = body.replace(/<iframe\b[^>]*\/>/gi, '');
  body = body.replace(/<source\b[^>]*>/gi, '');
  body = body.replace(/\s+\w*srcset="[^"]*"/gi, '');
  body = body.replace(/\s+action="[^"]*"/gi, '');            // inert forms
  body = body.replace(/<link\b[^>]*>/gi, '');
  body = body.replace(/<button\b[^>]*data-ci-nav-toggle[^>]*>[\s\S]*?<\/button>/i, NAV_TOGGLE);

  // images & media src -> local
  body = body.replace(/(\b(?:src|poster|data-src))="([^"]*)"/gi, (m, attr, url) => {
    if (/^(data:|blob:|#)/i.test(url)) return m;
    try {
      const u = new URL(url, BASE);
      if (u.origin !== BASE) return `${attr}=""`;
      const loc = localAsset(u.href);
      return loc ? `${attr}="${loc}"` : `${attr}=""`;
    } catch { return `${attr}=""`; }
  });
  // url(...) in inline styles
  body = body.replace(/url\((['"]?)(https?:\/\/[^)'"]+|\/[^)'"]+)\1\)/gi, (m, q, url) => {
    try {
      const u = new URL(url, BASE);
      const loc = localAsset(u.href);
      return loc ? `url(${q}${loc}${q})` : 'url()';
    } catch { return 'url()'; }
  });
  // links
  body = body.replace(/href="([^"]*)"/gi, (m, h) => `href="${rewriteHref(h)}"`);
  return body;
}

// ---- Vietoria rebrand (applied to every generated page) ----
function rebrand(html) {
  html = html.replace(/(rel="icon"[^>]*href="(?:\.\.\/)*\/?assets\/img\/)ecovis-logo-red\.png/g, '$1tth-mark.png');
  html = html.replace(/<img src="((?:\.\.\/)*\/?assets\/img\/)ecovis-logo-red\.png"[^>]*>/g,
    '<img src="$1tth-logo.png" alt="Vietoria" style="height:40px;width:auto;display:block">');
  html = html.replace(/<span style="font-size:19px;font-weight:400;color:#6B6E6F;padding-left:14px;border-left:1px solid #E3E3E5;white-space:nowrap">Vietnam Law<\/span>/g, '');
  html = html.replace(/<img src="((?:\.\.\/)*\/?assets\/img\/)ecovis-logo-white\.png"[^>]*>/g,
    '<span style="display:inline-flex;background:#fff;border-radius:4px;padding:9px 14px"><img src="$1tth-logo.png" alt="Vietoria" style="height:30px;width:auto;display:block"></span>');
  html = html.replace(/<span style="font-size:16px;font-weight:400;color:rgba\(255,255,255,\.9\);padding-left:12px;border-left:1px solid rgba\(255,255,255,\.28\);white-space:nowrap">Vietnam Law<\/span>/g, '');
  html = html.replace(/ECOVIS Vietnam Law/g, 'Vietoria');
  html = html.replace(/ECOVIS Vietnam/g, 'Vietoria');
  html = html.replace(/ECOVIS in Vietnam/g, 'Vietoria in Vietnam');
  html = html.replace(/alt="ECOVIS"/g, 'alt="Vietoria"');
  // firm-specific leftovers (network refs kept intentionally)
  const R = [
    [/— ECOVIS<\/title>/g, '— Vietoria</title>'], [/ - ECOVIS<\/title>/g, ' - Vietoria</title>'],
    [/— ECOVIS (?=[A-Z])/g, '— Vietoria '], [/ECOVIS&hellip;/g, 'Vietoria&hellip;'],
    [/>ECOVIS Solution/g, '>Vietoria Solution'], [/ECOVIS Practical Framework/g, 'Vietoria Practical Framework'],
    [/ECOVIS practical framework/g, 'Vietoria practical framework'], [/ECOVIS risk-management/g, 'Vietoria risk-management'],
    [/ECOVIS mean by/g, 'Vietoria mean by'], [/ECOVIS Advisory Angle/g, 'Vietoria Advisory Angle'],
    [/ECOVIS continuity/g, 'Vietoria continuity'], [/ECOVIS clients?\?/g, 'Vietoria client?'],
    [/ECOVIS offices in the issuing/g, 'Vietoria offices in the issuing'],
    [/ECOVIS assist with factory setup/g, 'Vietoria assist with factory setup'],
    [/ECOVIS advise on the commercial/g, 'Vietoria advise on the commercial'],
    [/ECOVIS review a partner/g, 'Vietoria review a partner'], [/>ECOVIS can integrate/g, '>Vietoria can integrate'],
    [/>ECOVIS provided/g, '>Vietoria provided'], [/ECOVIS attribution on the document/g, 'Vietoria attribution on the document'],
  ];
  for (const [re, rep] of R) html = html.replace(re, rep);
  // drop requested service-card list items (homepage)
  for (const t of ['Data Protection &amp; Cybersecurity', 'Intellectual Property', 'Compliance &amp; Internal Investigations']) {
    html = html.replace(new RegExp(
      '\\s*<span style="display:flex;align-items:baseline[^"]*">\\s*' +
      '<span aria-hidden="true"[^>]*></span><a [^>]*>' + t + '</a>\\s*</span>', 'g'), '');
  }
  return html;
}

// ---- Vietoria navy/gold theme (applied to every generated page) ----
function theme(html) {
  const NAVY_DEEP = '#10264A', NAVY = '#1F3B68', STEEL = '#2F5A94';
  const GOLD_DARK = '#B08A2E', GOLD = '#D2A051';
  // full gradient sequences first (order matters: navy -> gold sweep)
  html = html.replace(
    /linear-gradient\((\d+deg),#C6093B,#CD1437,#B41446,#A71645,#8C0550\)/gi,
    `linear-gradient($1,${NAVY_DEEP},${NAVY},${STEEL},${GOLD_DARK},${GOLD})`);
  html = html.replace(
    /background:#C6093B([^>]*><\/span><span style="flex:1;background:)#CD1437([^>]*><\/span><span style="flex:1;background:)#B41446([^>]*><\/span><span style="flex:1;background:)#A71645([^>]*><\/span><span style="flex:1;background:)#8C0550/gi,
    `background:${NAVY_DEEP}$1${NAVY}$2${STEEL}$3${GOLD_DARK}$4${GOLD}`);
  html = html.replace(
    /background:#C6093B([^>]*><\/span><span style="flex:1;background:)#B41446([^>]*><\/span><span style="flex:1;background:)#A71645([^>]*><\/span><span style="flex:1;background:)#8C0550/gi,
    `background:${NAVY_DEEP}$1${NAVY}$2${GOLD_DARK}$3${GOLD}`);
  // rgba families
  html = html.replace(/46,6,28/g, '12,26,50').replace(/198,9,59/g, '31,59,104');
  // per-color leftovers
  html = html.replace(/#C6093B/gi, NAVY).replace(/#8C0550/gi, NAVY_DEEP)
    .replace(/#CD1437/gi, STEEL).replace(/#CD1432/gi, STEEL)
    .replace(/#B41446/gi, GOLD_DARK).replace(/#A71645/gi, GOLD)
    .replace(/#EAEBED/gi, '#F3F1E8').replace(/#F6F6F7/gi, '#F6F4ED')
    .replace(/#F7F7F8/gi, '#F7F5EF').replace(/#FFF9F9/gi, '#F8F6F0')
    .replace(/#FFF3F5/gi, '#F0F4FA').replace(/#E3E3E5/gi, '#E6E2D6')
    .replace(/#D8D9DB/gi, '#DAD6C8').replace(/#B9BBBD/gi, '#BBB7A9');
  // primary buttons (navy/deep-navy bg + white text) -> gold bg + navy text
  html = html.replace(/style="[^"]*"/g, m => {
    for (const c of ['#1F3B68', '#10264A']) {
      if (m.includes(`background:${c};color:#fff`) && m.includes('font-weight'))
        return m.replace(`background:${c};color:#fff`, `background:${GOLD};color:${NAVY_DEEP}`);
    }
    return m;
  });
  return html;
}

function pageHtml(lang, title, desc, body) {
  return `<!DOCTYPE html>
<html lang="${lang || 'en-US'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${rebrand(title || 'Vietoria')}</title>
${desc ? `<meta name="description" content="${rebrand(desc)}">\n` : ''}<link rel="icon" type="image/png" href="/assets/img/tth-mark.png">
<link rel="stylesheet" href="/assets/css/theme.css">
<style>
/* Scriptless mobile nav: hidden checkbox + label toggle. No JavaScript anywhere. */
#ev-nav-check{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden}
#ev-nav-check:focus-visible + [data-ci-nav-toggle]{outline:3px solid #D2A051;outline-offset:2px}
#ev-nav-check:checked ~ [data-ci-nav-toggle] [data-ci-nav-icon-open]{display:none !important}
#ev-nav-check:checked ~ [data-ci-nav-toggle] [data-ci-nav-icon-close]{display:block !important}
#ev-nav-check:checked ~ #ci-primary-nav{display:flex !important}
@media (max-width:900px){
  #ev-nav-check:checked ~ #ci-primary-nav{opacity:1 !important;visibility:visible !important;transform:none !important;transition:none}
}
@media (max-width:560px){
  [data-ci-hdr]{padding:0 16px !important;gap:16px !important;min-height:64px !important}
  [data-ci-hdr] > a > picture img{height:30px !important}
  [data-ci-hdr] > a > span{font-size:15px !important;padding-left:10px !important}
}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

function relativize(html, depth) {
  const P = '../'.repeat(depth);
  html = html.replace(/((?<![\w-])(?:href|src|poster))="\/([^"]*)"/g, `$1="${P}$2"`);
  html = html.replace(/url\((['"]?)\//g, `url($1${P}`);
  return html;
}

// ---------------- crawl ----------------

async function processPage(url) {
  let html;
  try { html = await get(url); } catch (e) { failed.add(url); console.log('FAIL', e.message); return; }
  if (!/<html/i.test(html)) { failed.add(url); return; }
  const lang = (html.match(/<html[^>]*lang="([^"]+)"/) || [])[1];
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const body = transformBody(html);
  const p = new URL(url).pathname;
  pages.set(url, { path: p, lang, title, desc, body });
  fetched.add(url);
  console.log('ok  ', p);
}

async function worker() {
  while (queue.length) {
    const u = queue.shift();
    if (fetched.has(u) || failed.has(u)) continue;
    await processPage(u);
    await new Promise(r => setTimeout(r, 40));
  }
}

async function downloadAssets() {
  const jobs = [];
  for (const [url, name] of imgMap) jobs.push({ url, out: path.join(OUT, 'assets', 'img', name) });
  for (const [url, name] of fileMap) jobs.push({ url, out: path.join(OUT, 'assets', 'files', name) });
  let done = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (jobs.length) {
      const j = jobs.shift();
      try {
        const buf = await get(j.url, 'bin');
        fs.mkdirSync(path.dirname(j.out), { recursive: true });
        fs.writeFileSync(j.out, buf);
        done++;
      } catch (e) { console.log('ASSET FAIL', j.url); }
    }
  }));
  console.log(`assets: ${done}/${imgMap.size + fileMap.size} downloaded`);
}

(async () => {
  // seed from sitemaps
  const idx = await get(`${BASE}/sitemap_index.xml`);
  for (const m of idx.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const sm = await get(m[1]);
    for (const u of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) enqueue(u[1]);
  }
  console.log(`seeded ${queue.length} pages`);

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`pages: ${pages.size} fetched, ${failed.size} failed`);

  await downloadAssets();

  // write pages
  for (const [url, pg] of pages) {
    const depth = pg.path === '/' ? 0 : pg.path.replace(/\/+$/, '').split('/').length;
    const out = relativize(theme(pageHtml(pg.lang, pg.title, pg.desc, rebrand(pg.body))), depth);
    const dir = pg.path === '/' ? OUT : path.join(OUT, pg.path.replace(/\/+$/, ''));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), out, 'utf8');
  }
  console.log('wrote', pages.size, 'pages');
  if (failed.size) console.log('FAILED:', [...failed].join('\n'));

  // apply Vietoria service categories + contact details to generated pages
  require('./update-services.js');
  // remove German-language content + lawyer profile references
  require('./cleanup-de-lawyers.js');
  // rebuild /services/ around the five Vietoria categories
  require('./fix-services-page.js');
})();
