# OASIS GROUP

Showcase website for OASIS GROUP, a Moroccan multiservices group — « L’excellence au service de vos ambitions. »

Four areas of expertise, each with its own page:

| Department | Scope | Page |
| --- | --- | --- |
| OASIS CORPORATE | Business advisory, management and services to companies | `/expertises/corporate` |
| OASIS PERFORMANCE | Sport, equipment and events | `/expertises/performance` |
| OASIS FACILITIES | Facility management, maintenance and general services | `/expertises/facilities` |
| OASIS IT | Technology, software development and digital transformation | `/expertises/it` |

The site is static (Vite + React) and is hosted on Vercel without any server to keep running: the only server-side code is one Vercel Function that e-mails contact-form requests.

## Structure

| Path | Purpose |
| --- | --- |
| `client/` | The website — Vite + React, plain CSS, black / white / grey design system, FR / EN / AR (RTL). **This is the Vercel project root.** |
| `client/api/contact.js` | Vercel Function behind the contact form: validation, anti-spam, e-mail delivery through [Resend](https://resend.com) |
| `client/vercel.json` | Build settings, routes (single-page app fallback), cache and security headers |
| `package.json` (root) | Local shortcuts only (`npm run dev`, `build`, … delegate to `client/`) — not used by Vercel |
| `.vercelignore` | Keeps local secrets (`.env` files, the old `server/` folder) out of `vercel` CLI uploads |

## Local development

Requirements: Node.js 20+.

```bash
npm run setup     # installs client/ dependencies
npm run dev       # http://localhost:3000 (also reachable from the local network)
```

Other scripts: `npm run build` (production build in `client/dist`), `npm run preview` (serves that build on port 3000), `npm run lint`. In `client/`: `npm run photos`, `npm run brand:assets`.

`npm run dev` and `npm run preview` also run `client/api/contact.js`, so the form behaves locally exactly as in production. To send real e-mails locally, copy `client/.env.example` to `client/.env.local` and fill in the contact-form variables.

## Deploying on Vercel

A standard single-project deployment (not Vercel Services):

| Setting (Project → Settings → Build and Deployment) | Value |
| --- | --- |
| Root Directory | `client` |
| Framework Preset | Vite |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

The last four are also set in `client/vercel.json`, so only the Root Directory has to be chosen (when importing the repository, or afterwards in the settings). `client/api/contact.js` is detected automatically and deployed as a Vercel Function at `/api/contact`.

1. Import the GitHub repository in Vercel and set **Root Directory** to `client`. If the project already exists and was created with the *Services* preset, switch its Framework Preset to *Vite*.
2. In **Project → Settings → Environment Variables**, add the contact-form variables (below) and, optionally, the public `VITE_*` settings.
3. Deploy. Every push to the main branch redeploys the site; other branches get preview URLs.

Routes: `/` and `/expertises/:slug`; any other path falls back to the home page. Hashed assets (`/assets/*`) are cached for a year, photographs for a week.

Plan note: Vercel's free **Hobby** plan is intended for personal, non-commercial use. For a company website, check Vercel's current fair-use terms — the **Pro** plan is the commercial option. Nothing in the project depends on the plan.

### Contact form

`POST /api/contact` validates the request (same rules as the form: required fields, e-mail, phone number in international format, message of 20–4000 characters, consent), rejects cross-site submissions, filters basic bots with a hidden honeypot field, limits each visitor to 5 requests per 10 minutes, and e-mails the request to the company with the visitor's address as *Reply-To*. Nothing is stored.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | API key of the Resend account (free tier available) |
| `CONTACT_TO_EMAIL` | Address(es) receiving the requests, comma-separated |
| `CONTACT_FROM_EMAIL` | Sender on a domain verified in Resend, e.g. `OASIS GROUP <site@your-domain.ma>`. Without it, Resend's test sender is used, which only delivers to the Resend account's own address |

While `RESEND_API_KEY` or `CONTACT_TO_EMAIL` is missing, the form stays visible but the site does not pretend to send: on submit, the endpoint answers `503` and the visitor sees a discreet notice that online sending will be available soon. If delivery fails, the visitor sees an error. In both cases they keep what they typed.

### Public settings (optional)

The official address, mobile and landline numbers, and the LinkedIn and Instagram profiles are set in `client/src/config/site.js`. The variables below add optional details; set them in Vercel (or `client/.env.local` locally). Empty values are not displayed anywhere — the site never shows placeholder coordinates or legal information.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public address, e.g. `https://www.oasisgroup.ma` — used for the social image URL and `sitemap.xml`. Defaults to the Vercel production domain |
| `VITE_CONTACT_EMAIL`, `VITE_CONTACT_WHATSAPP`, `VITE_CONTACT_HOURS` | Additional contact details (contact section, footer) |
| `VITE_LEGAL_NAME`, `VITE_LEGAL_FORM`, `VITE_LEGAL_RC`, `VITE_LEGAL_ICE`, `VITE_LEGAL_IF` | Legal mentions shown in the footer |
| `VITE_SOCIAL_FACEBOOK` | Official Facebook page (full `https://` URL); shown only once configured |

`VITE_*` values are built into the pages: redeploy after changing them.

## Website

Home sections, in order: Hero, À propos (vision, mission, values), Nos expertises, Pourquoi OASIS GROUP ?, Nos engagements, Nos réalisations, Carrières, Contact. Each department page has its own hero, introduction, services, approach, links to the other departments and a contact form preset to that department. Page changes use the View Transitions API when available.

Motion is limited to reveal-on-scroll, parallax on photographs and hover states. Everything is disabled with `prefers-reduced-motion: reduce`, and content stays visible without JavaScript.

### Content to validate before going live

Nothing in the site is invented: no client references, figures, certifications, testimonials or contact details. What still needs a human check:

- Copy and service lists of each department — `client/src/i18n/dictionaries/{fr,en,ar}.js` (`departments.*`), written from each department's stated scope.
- Department settings (order, photos, slugs) — `client/src/config/departments.js`.
- Projects — `client/src/config/projects.js`. Empty by default: the section shows « Nos références, sur demande. » with contact buttons. Add only real projects whose client agreed to publication.
- Open positions — `client/src/config/careers.js`. Empty by default: the section invites spontaneous applications.
- Company details — environment variables above.

### Photography

Photos come from Unsplash (Unsplash License — free for commercial use). The catalogue is `client/src/content/photos.js`; `npm run photos` (in `client/`) downloads them and writes responsive WebP files to `client/public/photos/` and blur placeholders to `client/src/content/photoMeta.js`. To replace a photo with a company photo, change its `source` (or drop the file into the cache, see the script header) and re-run the script.

### Brand assets

The official logo is `client/brand/oasis-group-logo.png` (white on transparent). `npm run brand:assets` (in `client/`) derives everything from it, copying its pixels without redrawing them:

- `client/src/assets/brand/oasis-group-logo.png` — the logo trimmed to its artwork, used in the header, menu and footer. It is never displayed larger than its intrinsic size.
- `client/src/assets/brand/oasis-group-emblem.png` — the "O" emblem alone, used as a mask so it takes the colour of the surrounding text (diagram of the "Pourquoi" section, link to the group on department pages).
- `client/public/favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.png`.

The current file is small (artwork of 100 × 39 px): it is sharp at its size on standard screens but soft on high-density screens and in the large icons. To fix that, replace `client/brand/oasis-group-logo.png` with a larger export of the same logo (white on transparent, ideally 4× or more), run `npm run brand:assets`, and update `LOGO_WIDTH` / `LOGO_HEIGHT` in `client/src/landing/ui.jsx` and the emblem's `aspect-ratio` in `client/src/styles/global.css` with the sizes printed by the script, divided by the same factor.
