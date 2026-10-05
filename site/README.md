# Vietoria — static site mirror

A complete static mirror of ecovislaw.vn — **201 pages**, English only
(the German `de/` section, German-language posts, German Desk page, and
lawyer profile pages have been removed at the owner's request).

Rebranded to **Vietoria** with a navy/gold theme matching the logo:
navy `#10264A / #1F3B68 / #2F5A94`, gold `#D2A051 / #B08A2E`, warm
neutrals `#F3F1E8` sections, `#E6E2D6` borders.

Pure HTML + CSS: **no JavaScript, no external requests, no backend.**
Internal links are rewritten to local pages, so the whole site is
navigable offline. The mobile menu and FAQ accordions work via native
HTML/CSS only (`<details>` + a checkbox toggle).

## Contents

```
index.html              English homepage
<page>/index.html       one folder per page (e.g. about/, contact/, …)
de/…/index.html         German-language pages
assets/img/             102 images (logo, hero, team, article cards…)
assets/files/           downloadable files (PDF guide)
assets/css/theme.css    shared stylesheet (layout, hover, responsive)
Dockerfile              optional static-site container
```

## Deploy — pick any one

**Just open it** — double-click `index.html`. Works from `file://`,
no server needed.

**Any static host** — upload the folder to Netlify, GitHub Pages,
Vercel, Cloudflare Pages, S3+CloudFront, IIS, Apache, nginx…
No build step. Pages resolve as `/about/` or `/about/index.html`.

**Local server**
```bash
npx serve .          # or: python -m http.server 8080
```

**Docker (nginx)**
```bash
docker build -t ecovis-static .
docker run -p 8080:80 ecovis-static
# → http://localhost:8080
```

## Notes

- The contact form is inert (no `action`) — submitting just reloads
  the page. Wire it to a form endpoint if you need real submissions.
- WordPress endpoints (search, feeds, wp-admin) and one URL that 404s
  on the live site are dead links (`#!`) — same behaviour as upstream.
- Regenerate with `node mirror.js` from the parent folder — Vietoria
  branding, the navy/gold theme, and the removed homepage service
  items are all reapplied automatically. `retheme.js` can re-apply the
  theme to the already-generated pages without re-fetching.
