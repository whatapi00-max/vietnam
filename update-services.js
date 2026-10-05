// update-services.js — Vietoria real services (from flyer) + contact details
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

const DOTS = ['#1F3B68', '#B08A2E', '#D2A051', '#2F5A94', '#10264A'];

const CATS_EN = [
  { h: 'Investment Advisory', page: 'services/fdi-market-entry-vietnam/', items: [
    ['FDI setup &amp; support', 'services/fdi-market-entry-vietnam/'],
    ['Market entry strategy', 'services/fdi-market-entry-vietnam/'],
    ['Business development', 'business-advisory-desk/']] },
  { h: 'Accounting &amp; Tax Services', page: 'services/operational-compliance-vietnam/', items: [
    ['Bookkeeping &amp; reporting', 'services/operational-compliance-vietnam/'],
    ['VAT, CIT, PIT &amp; payroll', 'services/operational-compliance-vietnam/'],
    ['Financial consulting', 'business-advisory-desk/']] },
  { h: 'Corporate Services', page: 'services/corporate-transactions-vietnam/', items: [
    ['Company formation', 'services/fdi-market-entry-vietnam/'],
    ['Corporate governance', 'services/corporate-transactions-vietnam/'],
    ['Contracts &amp; restructuring', 'services/corporate-transactions-vietnam/']] },
  { h: 'M&amp;A &amp; Transactions', page: 'services/corporate-transactions-vietnam/', items: [
    ['Due diligence', 'services/corporate-transactions-vietnam/'],
    ['Acquisitions &amp; investment', 'services/corporate-transactions-vietnam/'],
    ['Corporate transactions', 'services/corporate-transactions-vietnam/']] },
];

const CATS_DE = [
  { h: 'Investitionsberatung', page: 'services/fdi-market-entry-vietnam/', items: [
    ['FDI-Setup &amp; Begleitung', 'services/fdi-market-entry-vietnam/'],
    ['Markteintrittsstrategie', 'services/fdi-market-entry-vietnam/'],
    ['Geschäftsentwicklung', 'business-advisory-desk/']] },
  { h: 'Buchhaltung &amp; Steuern', page: 'services/operational-compliance-vietnam/', items: [
    ['Buchführung &amp; Reporting', 'services/operational-compliance-vietnam/'],
    ['USt., KSt., ESt. &amp; Payroll', 'services/operational-compliance-vietnam/'],
    ['Finanzberatung', 'business-advisory-desk/']] },
  { h: 'Corporate Services', page: 'services/corporate-transactions-vietnam/', items: [
    ['Unternehmensgründung', 'services/fdi-market-entry-vietnam/'],
    ['Corporate Governance', 'services/corporate-transactions-vietnam/'],
    ['Verträge &amp; Umstrukturierung', 'services/corporate-transactions-vietnam/']] },
  { h: 'M&amp;A &amp; Transaktionen', page: 'services/corporate-transactions-vietnam/', items: [
    ['Due Diligence', 'services/corporate-transactions-vietnam/'],
    ['Akquisitionen &amp; Investitionen', 'services/corporate-transactions-vietnam/'],
    ['Unternehmenstransaktionen', 'services/corporate-transactions-vietnam/']] },
];

function grid(cats, P) {
  const cols = cats.map((c, i) => `
          <div style="display:grid;align-content:start;gap:0">
            <div aria-hidden="true" style="position:relative;height:14px;margin-bottom:20px">
              <span style="position:absolute;left:0;top:0;width:14px;height:14px;border-radius:50%;background:${DOTS[i]};box-shadow:0 0 0 4px #fff"></span>
            </div>
            <h3 style="margin-top:0;font-size:21px;font-weight:600;line-height:1.3"><a href="${P}${c.page}index.html" style="color:inherit;text-decoration:none">${c.h}</a></h3>
            <div style="display:grid;gap:8px;margin-top:16px;padding-top:18px;border-top:1px solid #E6E2D6">${c.items.map(([t, l]) => `
              <span style="display:flex;align-items:baseline;gap:8px;font-size:15px;line-height:1.4;color:#383A3B">
                <span aria-hidden="true" style="flex:0 0 6px;height:1px;margin-top:10px;background:#1F3B68"></span><a href="${P}${l}index.html" style="color:inherit;text-decoration:none" data-hv="hv5">${t}</a>
              </span>`).join('')}
            </div>
          </div>`).join('');
  return `<div data-ci-journey="" style="position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:32px">
        <span data-ci-journey-rail="" aria-hidden="true" style="position:absolute;left:7px;top:6px;width:calc(75% + 19px);height:2px;background:#E6E2D6"></span>${cols}
      </div>`;
}

const FOOT_EN = ['Investment Advisory|services/fdi-market-entry-vietnam/',
  'Accounting &amp; Tax Services|services/operational-compliance-vietnam/',
  'Corporate Services|services/corporate-transactions-vietnam/',
  'M&amp;A &amp; Transactions|services/corporate-transactions-vietnam/'];
const FOOT_DE = ['Investitionsberatung|services/fdi-market-entry-vietnam/',
  'Buchhaltung &amp; Steuern|services/operational-compliance-vietnam/',
  'Corporate Services|services/corporate-transactions-vietnam/',
  'M&amp;A &amp; Transaktionen|services/corporate-transactions-vietnam/'];

function footerLinks(items, label, P) {
  const links = items.map(s => {
    const [t, l] = s.split('|');
    return `        <a href="${P}${l}index.html" style="color:rgba(255,255,255,.9);text-decoration:none">${t}</a>`;
  }).join('\n');
  return `<h2 style="font-size:16px;font-weight:600;margin:0 0 16px">${label}</h2>
      <div style="display:grid;gap:12px;font-size:16px">
${links}
      </div>`;
}

let grids = 0, footers = 0, contacts = 0;
for (const f of walk(SITE)) {
  let h = fs.readFileSync(f, 'utf8');
  const rel = f.replace(/\\/g, '/');
  const isDE = rel.includes('/de/');
  const P = '../'.repeat(rel.split('/').length - 2); // site-root-relative prefix

  // 1) homepage journey grids
  const a = h.indexOf('<div data-ci-journey');
  if (a >= 0) {
    const end = h.indexOf('<p style="margin-top:40px', a);
    if (end > a) {
      h = h.slice(0, a) + grid(isDE ? CATS_DE : CATS_EN, P) + '\n    ' + h.slice(end);
      grids++;
    }
    if (isDE) {
      h = h.replace('Von der Investitionsentscheidung bis zum laufenden Betrieb', 'Umfassende Unternehmenslösungen in Vietnam')
           .replace('Klare Empfehlung, saubere Umsetzung, ein verantwortliches Team in Vietnam.', 'Wir helfen ausländischen Investoren und Unternehmen, in Vietnam mit Vertrauen zu starten, zu wachsen und erfolgreich zu sein.');
    } else {
      h = h.replace('Legal support from investment decision to daily operations', 'Comprehensive Business Solutions in Vietnam')
           .replace('Clear advice, practical execution and one accountable team in Vietnam.', 'We help foreign investors and businesses start, grow and succeed in Vietnam with confidence.');
    }
  }

  // 2) footer services column
  for (const [label, items] of [['Services', FOOT_EN], ['Leistungen', FOOT_DE]]) {
    const re = new RegExp(`<h2 style="font-size:16px;font-weight:600;margin:0 0 16px">${label}</h2>\\s*<div style="display:grid;gap:12px;font-size:16px">[\\s\\S]*?</div>`);
    if (re.test(h)) { h = h.replace(re, footerLinks(items, label, P)); footers++; }
  }

  // 3) contact details from flyer
  const before = h;
  h = h.replace(/vietnam@ecovislaw\.vn/g, 'vietoriabusinessservices@gmail.com')
       .replace(/quynh\.vu@ecovislaw\.vn/g, 'vietoriabusinessservices@gmail.com')
       .replace(/christine\.chou@ecovis\.com/g, 'vietoriabusinessservices@gmail.com')
       .replace(/tel:\+84898120121/g, 'tel:+84394430730')
       .replace(/\+84 898 120 121/g, '+84 394 430 730');
  if (h !== before) contacts++;

  fs.writeFileSync(f, h, 'utf8');
}
console.log({ grids, footers, contacts });
