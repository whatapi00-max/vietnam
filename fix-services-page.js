// fix-services-page.js — rebuild /services/ around the 5 Vietoria categories
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, 'site', 'services', 'index.html');
let h = fs.readFileSync(F, 'utf8');
const P = '../../';

const CARDS = [
  { h: 'Investment Advisory', d: 'FDI setup, market-entry strategy and business development for entering Vietnam.',
    link: 'services/fdi-market-entry-vietnam/', items: ['FDI setup &amp; support', 'Market entry strategy', 'Business development'] },
  { h: 'Accounting &amp; Tax Services', d: 'Bookkeeping, reporting and tax compliance — VAT, CIT, PIT and payroll.',
    link: 'services/operational-compliance-vietnam/', items: ['Bookkeeping &amp; reporting', 'VAT, CIT, PIT &amp; payroll', 'Financial consulting'] },
  { h: 'Corporate Services', d: 'Company formation, governance and contracts through the life of the entity.',
    link: 'services/corporate-transactions-vietnam/', items: ['Company formation', 'Corporate governance', 'Contracts &amp; restructuring'] },
  { h: 'M&amp;A &amp; Transactions', d: 'Due diligence, acquisitions and corporate transactions, end to end.',
    link: 'services/corporate-transactions-vietnam/', items: ['Due diligence', 'Acquisitions &amp; investment', 'Corporate transactions'] },
];

const DIRECTORY = [
  ['FDI setup &amp; support', 'services/fdi-market-entry-vietnam/'],
  ['Market entry strategy', 'services/fdi-market-entry-vietnam/'],
  ['Business development', 'business-advisory-desk/'],
  ['Bookkeeping &amp; reporting', 'services/operational-compliance-vietnam/'],
  ['VAT, CIT, PIT &amp; payroll', 'services/operational-compliance-vietnam/'],
  ['Financial consulting', 'business-advisory-desk/'],
  ['Company formation', 'services/fdi-market-entry-vietnam/'],
  ['Corporate governance', 'services/corporate-transactions-vietnam/'],
  ['Contracts &amp; restructuring', 'services/corporate-transactions-vietnam/'],
  ['Due diligence', 'services/corporate-transactions-vietnam/'],
  ['Acquisitions &amp; investment', 'services/corporate-transactions-vietnam/'],
  ['Corporate transactions', 'services/corporate-transactions-vietnam/'],
];

const card = c => `        <a href="${P}${c.link}index.html" data-ci-card="" style="position:relative;overflow:hidden;display:flex;flex-direction:column;gap:12px;background:#fff;border:1px solid #E6E2D6;border-radius:2px;padding:30px 32px 32px;text-decoration:none;color:inherit;box-shadow:0 1px 2px rgba(56,58,59,.05),0 8px 20px -12px rgba(56,58,59,.14)" data-hv="hv11">
          <span data-ci-bar="" aria-hidden="true" style="position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,#10264A,#1F3B68,#2F5A94,#B08A2E,#D2A051)"></span>
          <h3 style="font-size:22px;font-weight:600;line-height:1.3">${c.h}</h3>
          <p style="font-size:17px;line-height:1.55;color:#6B6E6F;text-wrap:pretty">${c.d}</p>
          <div style="display:grid;gap:8px;margin-top:8px;padding-top:16px;border-top:1px solid #E6E2D6">${c.items.map(t => `
            <span style="display:flex;align-items:baseline;gap:8px;font-size:15px;line-height:1.45;color:#383A3B">
              <span aria-hidden="true" style="flex:0 0 6px;height:1px;margin-top:10px;background:#1F3B68"></span>${t}            </span>`).join('')}
          </div>
          <span style="margin-top:auto;padding-top:18px;font-size:15px;font-weight:600;color:#1F3B68">Open ${c.h.replace(/&amp;/g,'&')} →</span>
        </a>`;

const practicesGrid = `<div data-ci-grid="3" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px">
${CARDS.map(card).join('\n')}
    </div>`;

const dirItem = ([t, l]) => `        <a href="${P}${l}index.html" style="display:flex;align-items:center;justify-content:space-between;gap:16px;background:#fff;padding:18px 24px;text-decoration:none;color:#383A3B;font-size:16px;font-weight:500" data-hv="hv12">
          ${t}          <span aria-hidden="true" style="flex:0 0 auto;color:#1F3B68">→</span>
        </a>`;

const dirGrid = `<div data-ci-grid="2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:#E6E2D6;border:1px solid #E6E2D6;border-radius:2px;overflow:hidden">
${DIRECTORY.map(dirItem).join('\n')}
    </div>`;

// swap grid inside each labeled section
function swapGrid(h, label, gridAttr, newGrid) {
  const s = h.indexOf(`data-screen-label="${label}"`);
  if (s < 0) throw new Error('missing section ' + label);
  const secEnd = h.indexOf('</section>', s);
  const gStart = h.indexOf(`<div data-ci-grid="${gridAttr}"`, s);
  if (gStart < 0 || gStart > secEnd) throw new Error('missing grid in ' + label);
  const gEnd = h.lastIndexOf('</div>', secEnd);
  return h.slice(0, gStart) + newGrid + h.slice(gEnd + 6);
}

h = swapGrid(h, 'Practices', '3', practicesGrid);
h = swapGrid(h, 'Directory', '2', dirGrid);

h = h.replace('>Practice groups', '>Our services')
     .replace('What we are engaged for, most often', 'Comprehensive Business Solutions in Vietnam')
     .replace('>Full directory', '>Services A to Z')
     .replace('All 17 service lines, A to Z', 'Four practices, twelve services')
     .replace('Five practices, fifteen services', 'Four practices, twelve services');

fs.writeFileSync(F, h, 'utf8');
console.log('services page rebuilt');
