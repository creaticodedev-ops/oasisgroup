# OASIS GROUP

Showcase website for OASIS GROUP, a Moroccan multiservices group — « L’excellence au service de vos ambitions. »

Four areas of expertise, each with its own page:

| Department | Scope | Page |
| --- | --- | --- |
| OASIS CORPORATE | Business advisory, management and services to companies | `/expertises/corporate` |
| OASIS PERFORMANCE | Sport, equipment and events | `/expertises/performance` |
| OASIS FACILITIES | Facility management, maintenance and general services | `/expertises/facilities` |
| OASIS IT | Technology, software development and digital transformation | `/expertises/it` |

The public site sends quote, contact and application requests to the API; they are reviewed in a password-protected admin dashboard (`/admin`).

## Structure

| Folder | Purpose |
| --- | --- |
| `client/` | Website + admin — Vite + React, plain CSS, black / white / grey design system, FR / EN / AR (RTL) |
| `server/` | Express API + MongoDB (requests, admin authentication, notifications) |
| `scripts/dev.mjs` | Starts both for local development |

## Getting started

Requirements: Node.js 20+, MongoDB running locally (MongoDB Compass can connect to the same URI).

```bash
npm run setup                          # installs client/ and server/ dependencies
copy server\.env.example server\.env   # Windows (cp on macOS/Linux)
copy client\.env.example client\.env   # optional — public contact details
npm run dev
```

- Website: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin (also linked discreetly from the footer)
- API health check: http://localhost:3000/api/health (proxied to the API on port 5000)

If port 5000 is already in use, start with another one for both processes, e.g. in PowerShell: `$env:PORT=5055; $env:API_PORT=5055; npm run dev`.

Other scripts: `npm run build`, `npm run lint`, `npm run dev:client`, `npm run dev:server`, and in `client/`: `npm run photos`, `npm run brand:assets`.

## Website

Routes: `/` (home) and `/expertises/:slug` (department pages). Any other path falls back to the home page. Page changes use the View Transitions API when available.

Home sections, in order: Hero, À propos (vision, mission, values), Nos expertises, Pourquoi OASIS GROUP ?, Nos engagements, Nos réalisations, Carrières, Contact. Each department page has its own hero, introduction, services, approach, links to the other departments and a contact form preset to that department.

Motion is limited to reveal-on-scroll, parallax on photographs and hover states. Everything is disabled with `prefers-reduced-motion: reduce`, and content stays visible without JavaScript.

### Content to validate before going live

Nothing in the site is invented: no client references, figures, certifications, testimonials or contact details. What still needs a human check:

- Copy and service lists of each department — `client/src/i18n/dictionaries/{fr,en,ar}.js` (`departments.*`), written from each department's stated scope.
- Department settings (order, photos, slugs) — `client/src/config/departments.js`.
- Projects — `client/src/config/projects.js`. Empty by default: the section shows « Nos références, sur demande. » with contact buttons. Add only real projects whose client agreed to publication.
- Open positions — `client/src/config/careers.js`. Empty by default: the section invites spontaneous applications.
- Company details — `client/.env` (see below). Empty values are simply not displayed.

### Photography

Photos come from Unsplash (Unsplash License — free for commercial use). The catalogue is `client/src/content/photos.js`; `npm run photos` (in `client/`) downloads them and writes responsive WebP files to `client/public/photos/` and blur placeholders to `client/src/content/photoMeta.js`. To replace a photo with a company photo, change its `source` (or drop the file into the cache, see the script header) and re-run the script.

### Brand assets

The monogram is drawn in SVG (`BrandMark` in `client/src/landing/ui.jsx`). `npm run brand:assets` (in `client/`) regenerates the favicons and the social sharing image from the same geometry.

## API

| Route | Purpose |
| --- | --- |
| `GET /api/health` | API and database status |
| `POST /api/inquiries` | New request: `type` (`quote`, `contact`, `career`), `department` (`group`, `corporate`, `performance`, `facilities`, `it`), `firstName`, `lastName`, `company` (optional), `email`, `phone` + `phoneCountry` (validated with libphonenumber-js, stored in E.164), `city` (optional), `message` (20–4000 characters), `consent: true`, `locale` |

`POST /api/inquiries` answers `201` on success, `422` with per-field errors, `429` when rate limited (5 requests per 10 minutes per IP) and `503` when the database is unavailable. A hidden honeypot field filters basic bots. Requests are stored in the `inquiries` collection; each one also creates an entry in `notifications` and is pushed live to open admin sessions.

## Admin dashboard

`/admin` — overview (statistics computed from the database: totals, last 30 days, breakdowns by status, subject and department), request list (search, filters by status / subject / department, sorting, pagination), request drawer with message, contact details and status history, and a notification centre with real-time alerts.

Statuses (internal key → label): `pending` → Nouvelle, `approved` → Qualifiée, `rejected` → Non retenue, `active` → En cours, `completed` → Traitée. Allowed transitions: `pending` → `approved` / `rejected`, `approved` → `active` (or back to `pending` / `rejected`), `rejected` → `pending`, `active` → `completed`, `completed` → `active`. Every change is recorded in the request's `history`.

WhatsApp follow-up: qualifying a request opens WhatsApp (`wa.me`) on the number submitted in the form, with an acknowledgement message in the sender's language (subject, department, date). The message can be edited and re-sent from the request drawer; the admin presses Send in WhatsApp.

The administrator account lives in the `adminaccounts` collection. On first start it is created from `ADMIN_PASSWORD` (12 characters minimum), which is hashed with scrypt immediately; the variable can then be removed from `server/.env`. The session is an HMAC-signed, httpOnly, SameSite=Strict cookie valid for 12 hours; failed sign-ins are throttled per IP. Without an account the admin API answers `503`.

Password reset ("Forgot password?" on the login page): a single-use token valid 30 minutes; only its SHA-256 hash is stored. The link (`/admin/reset#token=…`) is e-mailed to `ADMIN_EMAIL` when SMTP is configured, otherwise printed in the API server terminal. Password change: dashboard → Settings (`/admin/settings`).

| Route (all under `/api/admin`, session required except `/session` and `/password/*`) | Purpose |
| --- | --- |
| `GET` / `POST` / `DELETE /session` | Session status, sign in (`{ password }`), sign out |
| `POST /password/forgot` | Issues a reset link (`{ locale }`) |
| `POST /password/verify` | Checks a reset token (`{ token }`) — `410` if invalid or expired |
| `POST /password/reset` | Sets the new password (`{ token, password, confirm }`) |
| `POST /password/change` | Changes the password (`{ current, password, confirm }`) |
| `GET /stream` | Server-Sent Events: `inquiry`, `inquiry-update`, `notifications` |
| `GET /inquiries?q=&status=&type=&department=&sort=&order=&page=&limit=` | Paginated requests, with per-status counts |
| `GET /inquiries/:id` | Request detail and allowed transitions |
| `PATCH /inquiries/:id` | Status change (`{ status }`) — `409` if the transition is not allowed |
| `GET /stats?tz=` | Totals, per-status / subject / department breakdowns, last 30 days, latest requests |
| `GET /notifications?filter=unread&limit=` | Notifications with unread count |
| `POST /notifications/read` | Mark as read (`{ ids }` or `{ all: true }`) |
| `PATCH /notifications/:id` | Mark one as read or unread (`{ read }`) |

## Configuration

`server/.env`

| Variable | Default |
| --- | --- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/oasisgroup` |
| `PORT` | `5000` |
| `ADMIN_PASSWORD` | — (initial password only, hashed into the database on first start, then removable) |
| `ADMIN_SESSION_SECRET` | Optional — a random secret stored with the account is used when empty |
| `ADMIN_APP_URL` | `http://localhost:3000` (base of the reset link) |
| `ADMIN_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional — e-mail delivery of the reset link |

The admin account is stored in the database named in `MONGODB_URI`. When pointing an existing installation to a new database, set `ADMIN_PASSWORD` again for the first start.

`client/.env` (optional — empty values are not displayed anywhere)

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public site URL |
| `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE`, `VITE_CONTACT_WHATSAPP` | Contact details (contact section, footer, menu) |
| `VITE_COMPANY_ADDRESS`, `VITE_CONTACT_HOURS` | Address and opening hours |
| `VITE_LEGAL_NAME`, `VITE_LEGAL_FORM`, `VITE_LEGAL_RC`, `VITE_LEGAL_ICE`, `VITE_LEGAL_IF` | Legal mentions shown in the footer |
| `VITE_SOCIAL_LINKEDIN`, `VITE_SOCIAL_INSTAGRAM`, `VITE_SOCIAL_FACEBOOK` | Official profiles (full `https://` URLs); a network is shown only once configured |
