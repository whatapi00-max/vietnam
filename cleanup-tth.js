// cleanup-tth.js — TTH pass: remove lawyer photos, German relations, ECOVIS claims,
// Legal & Compliance category, and unrelated promo sections
const fs = require('fs');
const path = require('path');
const SITE = path.join(__dirname, 'site');

// ---- pages to delete (German-market pages + lawyer-seminar article) ----
const DEL_DIRS = [
  'german-desk-legal-services-ho-chi-minh-city',
  'choosing-german-speaking-legal-adviser-vietnam',
  'vietnam-fdi-legal-guide-german-investors',
  'relocating-production-china-to-vietnam-german-manufacturers',
  'china-plus-one-strategy-vietnam-german-manufacturers',
  'factory-setup-roadmap-vietnam-german-manufacturers',
  'german-engineering-services-company-vietnam-compliance',
  'german-lksg-supply-chain-due-diligence-vietnam-suppliers',
  'german-manufacturing-investment-in-vietnam-wfoe-setup-in-binh-duong',
  'vietnam-apostille-convention-germany-objection-2026',
  'vietnam-is-emerging-as-an-engineering-extension-platform-for-german-and-european-industry',
  'ecovis-germany-ecovis-vietnam-manufacturing-expansion',
  'vietnam-semiconductor-investment-china-go-global',
];
const DEAD = '(' + DEL_DIRS.join('|') + ')/';
const DEAD_HREF = `href="(?:\\.\\./)*${DEAD.slice(0, -1)}[^"]*"`;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

function cleanHtml(h, rel) {
  // /services/ page: drop old journey stages + update pagehead
  if (/services[\/\\]index\.html$/.test(rel)) {
    h = h.replace(/<section data-screen-label="Journey"[\s\S]*?<\/section>/, '');
    h = h.replace('Legal support from the investment decision to daily operations',
      'Comprehensive Business Solutions in Vietnam');
    h = h.replace(/Six practice groups, one accountable team in Vietnam\.[^<]*/,
      'Four practice areas, one accountable team in Vietnam. Every engagement states the work, the deliverables and the usual timeline.');
  }
  // --- dead-target cleanup ---
  const cardRe = new RegExp(`<a\\b(?=[^>]*data-ci-card)[^>]*${DEAD_HREF}[^>]*>[\\s\\S]*?<\\/a>`, 'g');
  h = h.replace(cardRe, '');
  h = h.replace(new RegExp(` ${DEAD_HREF}`, 'g'), '');

  // --- lawyer photos: "Your contact" aside cards keep heading + buttons only ---
  h = h.replace(/(<p[^>]*>Your contact<\/p>)\s*(?:<picture>[\s\S]*?<\/picture>|<img[^>]*>)\s*<p[^>]*>[\s\S]*?<\/p>\s*<p[^>]*>[\s\S]*?<\/p>/g, '$1');
  // any remaining lawyer/person photos (picture or bare img)
  h = h.replace(/<picture>\s*<img [^>]*(?:quynh|hong-giang|nhuan|christine|Attorney_VU)[^>]*>[\s\S]*?<\/picture>/gi, '');
  h = h.replace(/<img [^>]*(?:quynh|hong-giang|nhuan|christine|Attorney_VU)[^>]*>/gi, '');
  // knowledge-hub rail: photo link + name + role + linkedin
  h = h.replace(/<a class="ekos-rail__photo">[\s\S]*?<\/a>/g, '');
  h = h.replace(/<p class="ekos-rail__name">[\s\S]*?<\/p>/g, '');
  h = h.replace(/<p class="ekos-rail__role">[\s\S]*?<\/p>/g, '');
  h = h.replace(/<p class="ekos-rail__contact"><a href="https:\/\/www\.linkedin[^"]*"[^>]*>[\s\S]*?<\/a><\/p>/g, '');
  // bylines -> team
  h = h.replace(/(<p class="ekos-byline">By )<a[^>]*>[^<]*<\/a>, [^<]*/g, '$1the TTH Advisory Team ');
  // personal names -> team, then drop leftover role strings
  h = h.replace(/Attorney Vu Manh Quynh is the Managing Partner of TTH, advising/g, 'The TTH advisory team advises');
  h = h.replace(/Vu Le Nhu Quynh|Vu Manh Quynh|Nguyen T\. Hong Giang|Nguyen Nhuan|Christine Chou/g, 'TTH Advisory Team');
  h = h.replace(/Author: TTH Advisory Team[^<|]*/g, 'Author: TTH Advisory Team');
  h = h.replace(/TTH Advisory Team, (Managing Partner, )?Attorney-at-Law,? ?(TTH)?/g, 'TTH Advisory Team');
  h = h.replace(/TTH Advisory Team, Partner(, Attorney-at-Law)?( and Head of Tax)?,? ?(at TTH)?/g, 'TTH Advisory Team');
  h = h.replace(/TTH Advisory Team is the Managing Partner/g, 'TTH Advisory Team');
  // flatten leftover role titles
  h = h.replace(/Attorney TTH Advisory Team/g, 'TTH Advisory Team');
  h = h.replace(/TTH Advisory Team(<\/strong>|<\/a>)? is the Managing Partner of TTH, advising/g, 'TTH Advisory Team$1 advises');
  h = h.replace(/, Managing Partner, Attorney-at-Law at TTH/g, '');
  h = h.replace(/, Managing Partner, TTH/g, '');
  h = h.replace(/, Managing Partner/g, '');
  h = h.replace(/Managing Partner, /g, '');
  h = h.replace(/the Managing Partner:/g, 'the TTH team:');
  h = h.replace(/Managing Partner and person responsible for the content/g, 'TTH');
  h = h.replace(/, Attorney-at-Law/g, '');
  h = h.replace(/Attorney-at-Law, /g, '');
  h = h.replace(/Attorney-at-Law/g, 'legal adviser');
  h = h.replace(/Attorney TTH/g, 'TTH');

  // --- promo sections (homepage + about): ECOVIS stats, ecosystem logos, lawyer quote/team ---
  for (const label of ['Stats', 'Facts', 'Recognition', 'Network', 'Quote', 'Team', 'Advisor profiles']) {
    const re = new RegExp(`<section data-screen-label="${label}"[\\s\\S]*?<\\/section>`, 'g');
    h = h.replace(re, '');
  }

  // --- hero: remove ECOVIS/German chips ---
  h = h.replace(/\s*<span>ECOVIS International member firm<\/span>/g, '');
  h = h.replace(/\s*<span>German Desk led by the Managing Partner<\/span>/g, '');
  h = h.replace(/\s*<span>English · Deutsch · Tiếng Việt<\/span>/g, '');
  // hero subline -> neutral
  h = h.replace(/Legal, tax and advisory services for German Mittelstand, European manufacturers and Asian multinationals doing business in Vietnam — <strong[^>]*>backed by a network of 90\+ countries<\/strong>\./g,
    'Legal, tax and advisory services for foreign investors and businesses entering and operating in Vietnam.');

  // --- Legal & Compliance category removal ---
  // homepage journey card
  h = h.replace(/<div style="display:grid;align-content:start;gap:0">\s*<div aria-hidden="true"[^>]*>[\s\S]*?<\/div>\s*<h3[^>]*><a[^>]*>Legal &amp; Compliance<\/a><\/h3>\s*<div style="display:grid;gap:8px[^"]*">[\s\S]*?<\/div>\s*<\/div>/g, '');
  h = h.replace('grid-template-columns:repeat(5,minmax(0,1fr))', 'grid-template-columns:repeat(4,minmax(0,1fr))');
  h = h.replace('width:calc(80% + 26px)', 'width:calc(75% + 19px)');
  // footer Services column item (rgba-white links only)
  h = h.replace(/\s*<a href="[^"]*operational-compliance-vietnam\/index\.html" style="color:rgba\(255,255,255,\.9\)[^"]*">Legal &amp; Compliance<\/a>/g, '');
  // /services/ practice card + directory items for the removed category
  h = h.replace(/<a [^>]*data-ci-card[^>]*>[\s\S]*?<h3[^>]*>Legal &amp; Compliance<\/h3>[\s\S]*?<\/a>/g, '');
  h = h.replace(/<a [^>]*>\s*(Business licensing|Regulatory approvals|Ongoing compliance)\s*<span[^>]*>→<\/span>\s*<\/a>/g, '');
  // leftover "describe your matter" filler (even item count now)
  h = h.replace(/<a [^>]*>\s*Something else\? Describe your matter[\s\S]*?<\/a>/g, '');

  // --- footer / boilerplate claims ---
  h = h.replace(/Part of ECOVIS International[^<]*/g, '');
  h = h.replace(/Legal partner for foreign investment in Vietnam\.\s*/g,
    'Legal, tax and advisory services for foreign investors and businesses in Vietnam. ');
  h = h.replace(/Advice in English, German and Vietnamese/g, 'Advice in English and Vietnamese');
  h = h.replace(/English, German, Mandarin and Vietnamese/g, 'English and Vietnamese');
  h = h.replace(/English, German, Mandarin, Vietnamese/g, 'English and Vietnamese');
  h = h.replace(/English, Deutsch, 中文, Tiếng Việt/g, 'English and Vietnamese');
  h = h.replace(/Fluent in English, German and Vietnamese/g, 'Fluent in English and Vietnamese');

  // --- German Desk links / mentions ---
  h = h.replace(/<a [^>]*>[^<]*German Desk[^<]*<\/a>/g, '');
  h = h.replace(/<details>[\s\S]*?German Desk[\s\S]*?<\/details>/g, '');
  h = h.replace(/\s*Written by the partners on file, in English or German\./g, ' Written by the partners on file.');
  h = h.replace(/\.?\s*German-language calls can be scheduled for European mornings\./g, '.');
  h = h.replace(/,?\s*with a German Desk led by the Managing Partner/g, '');

  // --- ECOVIS / affiliation claims ---
  h = h.replace(/TTH \(Ecovis Orient Counsel\)/g, 'TTH');
  h = h.replace(/ law firm and the Vietnamese member of ECOVIS International/g, ' advisory firm');
  h = h.replace(/[^<>.]*(member of EuroCham|members of EuroCham|AHK Vietnam|German Business Association|listed by AHK)[^<>.]*\.?/g, '');
  h = h.replace(/[^<>.]*network of 90\+ countries[^<>.]*\.?/g, '');
  h = h.replace(/[^<>.]*19,000\+[^<>.]*\.?/g, '');
  h = h.replace(/[^<>.]*founded in Germany[^<>.]*\.?/g, '');
  h = h.replace(/Clients range from German Mittelstand manufacturers[^<.]*\./g,
    'Clients range from international manufacturers and corporates to businesses entering Vietnam.');
  h = h.replace(/Our lawyers and tax experts work in English and Vietnamese\./g,
    'Our advisers work in English and Vietnamese.');

  // --- author blocks -> TTH Advisory Team ---
  h = h.replace(/(<p[^>]*>Author<\/p>)\s*<p[^>]*>[^<]*<\/p>\s*<p[^>]*>[\s\S]*?<\/p>/g,
    '$1<p style="font-size:22px;font-weight:600;line-height:1.3">TTH Advisory Team</p>' +
    '<p style="font-size:17px;line-height:1.55;color:#6B6E6F;text-wrap:pretty">Lawyers, accountants and consultants supporting foreign investors in Vietnam.</p>');
  h = h.replace(/Contact the author/g, 'Contact us');
  h = h.replace('grid-template-columns:132px minmax(0,1fr)', 'grid-template-columns:minmax(0,1fr)');

  // --- language chips / meta ---
  h = h.replace(/<span>·<\/span><span>English &amp; Deutsch<\/span>/g, '');
  h = h.replace(/>English &amp; Deutsch</g, '>English<');
  h = h.replace(/[^<>.]*Deutschsprachige[^<>.]*\.?/g, '');
  h = h.replace(/in English, German or Vietnamese/g, 'in English or Vietnamese');
  h = h.replace(/, part of the ECOVIS International network/g, '');
  h = h.replace(/, a member firm of the ECOVIS International network/g, '');
  h = h.replace(/a member firm of the ECOVIS International network/g, 'an advisory firm');
  h = h.replace(/member law firm of ECOVIS International/g, 'law and advisory firm');
  h = h.replace(/, combining local legal expertise with the international standards of the ECOVIS network across more than 90 countries/g, '');
  h = h.replace(/, combining local regulatory expertise with the global ECOVIS professional network/g, '');
  h = h.replace(/German Desk, part of the ECOVIS International network/g, 'supporting foreign investors in Vietnam');
  h = h.replace(/>ECOVIS Offices</g, '>Offices<');
  h = h.replace(/German or European company investing in Vietnam\?/g, 'Investing in Vietnam?');
  h = h.replace(/German Mittelstand manufacturers/g, 'international manufacturers');
  h = h.replace(/Your home-country ECOVIS adviser and your Vietnam counsel coordinate inside one network\./g, '');
  h = h.replace(/Where a mandate involves another ECOVIS member firm[^<.]*\./g, '');
  h = h.replace(/or with ECOVIS accounting colleagues/g, '');

  // --- dead archive rows (href stripped -> unlinked teaser rows) ---
  h = h.replace(/<a (?![^>]*href=)[^>]*>\s*<span style="font-size:15px;font-weight:600;color:#6B6E6F;min-width:96px">[\s\S]*?<\/a>/g, '');

  // --- German-language version links + related-article list items ---
  h = h.replace(/<a [^>]*>Deutsch:[^<]*<\/a>\s*—\s*German-language version[^<.]*/g, '');
  h = h.replace(/<a [^>]*>[^<]*Deutsch[^<]*<\/a>/g, '');
  h = h.replace(/<li>[^<]*?(German|Deutsch|ECOVIS Germany)[^<]*?<\/li>/g, '');
  h = h.replace(/[^<>.]*German Desk[^<>.]*\.?/g, '');

  // --- remaining firm-level claims ---
  h = h.replace(/The firm is a member of ECOVIS International[^<.]*\./g,
    'TTH operates as an independent advisory firm in Ho Chi Minh City.');
  h = h.replace(/TTH is a member law firm of ECOVIS International[^<.]*\./g,
    'TTH provides legal and tax advisory services to foreign investors in Vietnam.');
  h = h.replace(/[^<>.]*member of the ECOVIS International network[^<>.]*\.?/g, '');
  h = h.replace(/Yes\. The firm advises in English, German, Vietnamese and Chinese[^<.]*\./g,
    'Yes. The firm advises in English and Vietnamese.');
  h = h.replace(/TTH regularly advises German Mittelstand companies[^<.]*\./g,
    'TTH regularly advises international manufacturers, European corporates and multinational groups.');
  h = h.replace(/TTH advises German Mittelstand and other European manufacturers/g,
    'TTH advises international manufacturers');
  h = h.replace(/TTH advises international companies — German, European and global —/g,
    'TTH advises international companies');
  h = h.replace(/the operational structure of many German Mittelstand companies/g,
    'the operational structure of many international companies');
  h = h.replace(/German and (other )?European parent compan(ies|y)/g, 'international parent companies');
  h = h.replace(/a German parent company/g, 'a foreign parent company');
  h = h.replace(/supply-chain due diligence for a German group under the LkSG/g,
    'supply-chain due diligence for an international group');
  h = h.replace(/Why is Vietnam attractive for German Mittelstand manufacturers\?/g,
    'Why is Vietnam attractive for international manufacturers?');
  h = h.replace(/Vietnam FDI legal guide for German investors/g,
    'Vietnam FDI legal guide for foreign investors');
  h = h.replace(/We combine local execution experience with the standards, communication and cross-border coordination[^<.]*\./g,
    'We combine local execution experience with clear communication and cross-border coordination.');

  // --- li items / anchors containing German refs (any markup inside) ---
  h = h.replace(/<li>(?:(?!<\/li>)[\s\S])*?(German|Deutsch|ECOVIS Germany)[\s\S]*?<\/li>/g, '');
  h = h.replace(/<a(?: [^>]*)?>[^<]*Deutsch[^<]*<\/a>[^<.]*/g, '');

  // --- ECOVIS coordination claims ---
  h = h.replace(/Working closely with ECOVIS member firms worldwide, we/g, 'Working with our specialist team, we');
  h = h.replace(/Working together with ECOVIS tax and accounting professionals, we/g, 'Our team');
  h = h.replace(/Working alongside ECOVIS member firms worldwide, we/g, 'Working alongside our specialist team, we');
  h = h.replace(/Together with ECOVIS member firms in Vietnam, yes — /g, 'Yes — ');
  h = h.replace(/Yes, together with ECOVIS member firms in Vietnam, so /g, 'Yes — ');
  h = h.replace(/existing ECOVIS relationships/g, 'existing client relationships');
  h = h.replace(/both ECOVIS firms maintained/g, 'both firms maintained');
  h = h.replace(/ECOVIS tax and accounting professionals/g, 'our tax and accounting professionals');
  h = h.replace(/ECOVIS advisors/g, 'our advisors');
  h = h.replace(/ECOVIS advisers/g, 'our advisers');
  h = h.replace(/\| ECOVIS(?=<\/title>)/g, '| TTH');

  // --- remaining German-market framing ---
  h = h.replace(/Vu Manh Quynh is the Managing Partner and Attorney-at-Law of TTH/g,
    'The TTH advisory team');
  h = h.replace(/The Germany–Vietnam Industrial Manufacturing Corridor/g, 'The International Manufacturing Corridor');
  h = h.replace(/The Germany–Vietnam industrial corridor/g, 'The international manufacturing corridor');
  h = h.replace(/Supply-chain labour compliance for German and EU parent companies/g,
    'Supply-chain labour compliance for international parent companies');
  h = h.replace(/Governance for German and European parent companies: LkSG and CS3D/g,
    'Governance for international parent companies');
  h = h.replace(/a German automotive supplier&#8217;s/g, 'an international automotive supplier&#8217;s');
  h = h.replace(/from Germany, Japan, South Korea, Turkey, Mexico and across the G20/g, 'from across the G20');
  h = h.replace(/<option>Deutsch<\/option>/g, '');
  h = h.replace(/TTH is the legal practice of ECOVIS International in Vietnam, /g, '');
  h = h.replace(/TTH is the Vietnamese member firm of ECOVIS International\./g,
    'TTH is an independent advisory firm in Ho Chi Minh City.');
  h = h.replace(/TTH is a member of ECOVIS International[^<.]*\./g,
    'TTH is an independent advisory firm in Vietnam.');
  h = h.replace(/, and through the ECOVIS [^<.]*/g, '.');
  h = h.replace(/Referral from an ECOVIS member firm/g, 'Referral from a partner firm');
  h = h.replace(/German-speaking[^<.]*\.?/g, '');
  h = h.replace(/supply-chain due diligence for a German group under LkSG/g,
    'supply-chain due diligence for an international group');
  h = h.replace(/German and European investors/g, 'international investors');
  h = h.replace(/Legal advice is delivered by TTH; tax, accounting and audit are delivered with ECOVIS member firms in Vietnam[^<.]*/g,
    'Legal advice is delivered by TTH; tax, accounting and audit are delivered by our team');
  h = h.replace(/Existing ECOVIS relationships and separate legal or tax workstreams can be coordinated for a Group already working[^<.]*/g,
    'Separate legal or tax workstreams can be coordinated for groups already working with partner firms');
  h = h.replace(/It is an ECOVIS practical risk-management concept/g, 'It is a practical risk-management concept');
  h = h.replace(/and the position of TTH within the ECOVIS[^<.]*/g, '');
  h = h.replace(/Supply-chain due diligence for a German group under LkSG/g,
    'Supply-chain due diligence for an international group');
  h = h.replace(/auditor or German parent expects/g, 'auditor or parent group expects');
  h = h.replace(/German automotive supplier, greenfield plant/g, 'International automotive supplier, greenfield plant');
  h = h.replace(/not only the German language but familiarity with/g, 'familiarity with');
  h = h.replace(/For German manufacturers with/g, 'For international manufacturers with');
  h = h.replace(/German and other European parent groups/g, 'International parent groups');
  h = h.replace(/German and Japanese investors/g, 'International investors');
  h = h.replace(/For German and other European investors/g, 'For international investors');
  h = h.replace(/For German and European groups/g, 'For international groups');
  h = h.replace(/Many European SMEs and Mittelstand manufacturers value:/g, 'Many international SMEs and manufacturers value:');

  // --- article cards left without a live link (target page deleted) ---
  h = h.replace(/<article data-ci-card[^>]*>[\s\S]*?<\/article>/g, m => /href=/.test(m) ? m : '');

  // --- FAQ / heading phrasing ---
  h = h.replace(/Do you advise in German and Chinese\?/g, 'Do you advise in English and Vietnamese?');
  h = h.replace(/Can we work entirely in German\?/g, 'Can we work entirely in English?');
  h = h.replace(/Do you advise German and European companies\?/g, 'Do you advise international companies?');
  h = h.replace(/Does LkSG compliance affect the choice of Vietnam legal advisor for a German manufacturer\?/g,
    'Does supply-chain compliance affect the choice of Vietnam legal advisor for an international manufacturer?');
  h = h.replace(/Can a German or European investor own the factory outright\?/g,
    'Can a foreign investor own the factory outright?');
  h = h.replace(/EPE facility for a German automotive supplier/g, 'EPE facility for an international automotive supplier');
  h = h.replace(/Choosing a German-Speaking Legal Adviser in Vietnam: Four Adviser Models and Seven Selection Criteria/g,
    'Choosing a Legal Adviser in Vietnam: Adviser Models and Selection Criteria');
  h = h.replace(/China\+1 strategy in Vietnam for German manufacturers/g, 'China+1 strategy in Vietnam for international manufacturers');
  h = h.replace(/China\+1 strategy guide for German and European manufacturers/g, 'China+1 strategy guide for international manufacturers');
  h = h.replace(/Chamber of commerce \(AHK, GBA, EuroCham, KOCHAM\)/g, 'Chambers of commerce');
  h = h.replace(/As part of a German-founded international professional network, /g, '');
  h = h.replace(/familiarity with German compliance frameworks/g, 'familiarity with international compliance frameworks');
  h = h.replace(/A growing number of German and European industrial firms/g, 'A growing number of international industrial firms');
  h = h.replace(/investors from Germany, Japan, Korea, Australia, or the US/g, 'investors from treaty countries');
  h = h.replace(/For German and other European investors/g, 'For international investors');

  // --- remove office address ---
  h = h.replace(/<p[^>]*>The Sun Avenue, Tower 1, Unit SAV1\.02\.11<br>28 Mai Chi Tho Street, Binh Trung Ward<br>Ho Chi Minh City, Vietnam<\/p>/g,
    '<p style="font-size:16px;line-height:1.6;color:rgba(255,255,255,.84)">Ho Chi Minh City, Vietnam</p>');
  h = h.replace(/Unit SAV1\.02\.11, Tower 1, The Sun Avenue, 28 Mai Chi Tho Street, Binh Trung Ward, Ho Chi Minh City(, Vietnam)?/g, 'Ho Chi Minh City, Vietnam');
  h = h.replace(/— Ho Chi Minh City, Vietnam\./g, 'in Ho Chi Minh City, Vietnam.');
  h = h.replace(/, Ho Chi Minh City, Vietnam, Ho Chi Minh City/g, ', Ho Chi Minh City');
  h = h.replace(/(Unit SAV1\.02\.11,? )?(Tower 1, )?The Sun Avenue,? ?/g, '');
  h = h.replace(/28 Mai Chi Tho Street, Binh Trung Ward,?/g, '');
  h = h.replace(/<br\s*\/?>\s*(?=Ho Chi Minh City)|Ho Chi Minh City, Vietnam<br\s*\/?>\s*<\/p>/g, '');

  // --- new contact email ---
  h = h.replace(/vietoriabusinessservices@gmail\.com/g, 'tthservices.info@gmail.com');
  // contact page Office block (address + map link); show city under hours instead
  if (/contact[\/\\]index\.html$/.test(rel)) {
    h = h.replace(/<div style="display:grid;gap:14px">\s*<p[^>]*>Office<\/p>[\s\S]*?<\/div>/, '');
    h = h.replace(/(Monday–Friday, 08:30–18:00 ICT \(GMT\+7\)\.?)<\/p>/,
      '$1<br>Ho Chi Minh City, Vietnam</p>');
  }
  return h;
}

// ---- delete dirs ----
let removed = 0;
for (const d of DEL_DIRS) {
  const p = path.join(SITE, d);
  if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true }); removed++; }
}

// ---- clean pages ----
let files = 0;
for (const f of walk(SITE)) {
  const h = fs.readFileSync(f, 'utf8');
  const o = cleanHtml(h, f);
  if (o !== h) { fs.writeFileSync(f, o, 'utf8'); files++; }
}
console.log({ dirsRemoved: removed, filesCleaned: files });
