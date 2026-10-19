// web3forms.js — wire every form to https://api.web3forms.com/submit
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, 'site');
const KEY = '13fcc78b-af9a-4d94-b0fc-0b32a087bdd5';
const REDIRECT = 'https://www.tthbusiness.com/thank-you/';

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) files.push(p);
  }
})(SITE);

let touched = 0;
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8');
  if (!h.includes('<form')) continue;
  const orig = h;

  // 1) form tag -> web3forms endpoint
  h = h.replace(/<form([^>]*?)method="post"([^>]*)>/gi, (m, a, b) => {
    if (/action=/.test(m)) return m;
    return `<form${a}method="POST" action="https://api.web3forms.com/submit"${b}>`;
  });

  // 2) inject web3forms hidden fields after each <form ...>
  h = h.replace(/(<form[^>]*action="https:\/\/api\.web3forms\.com\/submit"[^>]*>)/g, (m) => {
    if (h.includes('name="access_key"')) return m; // already done
    return m + `<input type="hidden" name="access_key" value="${KEY}"><input type="hidden" name="subject" value="TTH website enquiry"><input type="hidden" name="from_name" value="TTH Website"><input type="hidden" name="redirect" value="${REDIRECT}">`;
  });

  // 3) drop obsolete WP hidden fields
  h = h.replace(/<input type="hidden"[^>]*name="(ev_nonce|_wp_http_referer|ev_ts|ev_recaptcha_token|ecl_token|ecl_file|ecl_ts|ecl_page)"[^>]*\/?>/g, '');
  // rename "action" hidden -> keep as informational field
  h = h.replace(/name="action" value="ecovis_enquiry"/g, 'name="form_type" value="enquiry"');
  h = h.replace(/name="action" value="ecovis_checklist_dl"/g, 'name="form_type" value="checklist_download"');
  // 4) honeypot -> web3forms botcheck
  h = h.replace(/<input type="text" name="(ev_website|ecl_website)"[^>]*>/g, '<input type="checkbox" name="botcheck" style="display:none">');

  if (h !== orig) { fs.writeFileSync(f, h); touched++; }
}
console.log('web3forms wired into', touched, 'files');
