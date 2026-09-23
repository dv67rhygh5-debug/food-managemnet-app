# Fedd — PRD

Renamed from "Wastelytics" to "Fedd" (Session 6) to match the fedd.in domain. Brand name changed throughout the app, but the original scope below is otherwise unchanged.

## Original Problem Statement
Build a responsive, interactive web frontend for "Wastelytics" (now "Fedd") — a subscription-based analytics platform helping restaurants track, understand, and reduce food waste, with an integrated NGO marketplace for surplus food redistribution as a secondary feature. Clean B2B SaaS aesthetic, dark mode, English/Hindi toggle, three portals (Restaurant / NGO / Admin), and rich mocked workflows in local React state.

## User Personas
- **Restaurant owner/manager** (primary): logs surplus, reviews insights, acts on recommendations
- **NGO coordinator** (secondary): browses live listings, claims food, tracks pickups
- **Platform admin**: reviews verifications, watches network stats

## Core Requirements (static)
- Landing page with hero, pricing tickets, partner marquee, About/Support/Terms
- Restaurant portal (Overview, Log surplus, Marketplace, Billing)
- NGO portal (Live listings, Map, My claims, Verification status)
- Admin portal (Overview, Verification queue, Subscribers, Rescues)
- Dark mode + English/Hindi language toggle
- Toast notifications, count-up KPI feel, live-update dashboard on log submit
- Mocked auth (role-based bypass), state in React + localStorage

## Implemented (dates)
- **Session 1 (initial build)**: Landing, portals, dashboard KPIs, log form, marketplace, dark mode, language toggle, mock data seeding, kitchen-ticket UI motif
- **Session 2 (additions)**: Partner marquee & rotating headline, PartnerNetwork filter cards, Expiry watch, Waste playbook, Inventory reorder watch, NGO Map view, Multi-outlet selector, CSV export, Benchmarking card, Referral card, About & Terms modal
- **Session 3 (fixes — Feb 2026)**:
  - Fixed undefined `setShowLogin` reference in Landing (lint blocker)
  - Log Surplus form now captures `storage`, `foodType`, `pickupTime`, `packaging`, `photo` fields into state
  - LoginModal accepts `close` prop, supports backdrop-click to close
  - TermsModal supports backdrop-click to close
  - Notifications bell shows toast feedback
  - "View all" link shows toast feedback
  - Hindi copy extended for NGO nav labels (Live listings, Map, Verification status) and shared strings

## Prioritized Backlog
### P2
- Split monolithic `App.js` into `pages/` and `components/` folders
- Listing "priority"/"dietary"/"storage" badges are cosmetic placeholders (`"—"`/`"Medium"`) since the backend schema doesn't carry them — either add real columns or drop the badges
- "Edit listing" button on marketplace cards is still a toast-only stub
- About/Terms pages are intentionally blank placeholders (kicker + "content coming soon") — a teammate is designing the real content separately; swap in once ready
- Toast messages (`toast.success`/`toast.error` calls) are still English-only by design (scoped out of the Hindi translation pass as transient/lower-priority) — revisit if that turns out to matter

## Payment approach (decided)
No payment gateway (Razorpay/Stripe explicitly excluded). Restaurants scan a static QR code (own UPI/bank QR) and submit a reference note; an admin manually approves/rejects via the billing endpoints. See `backend/routers/billing.py`.

## Backend (Session 4 — built)
- Stack: FastAPI + **Supabase** (Postgres + Supabase Auth + Supabase Storage). MongoDB/motor removed.
- `backend/config.py` — env/config + Supabase client (placeholders in `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_STORAGE_BUCKET`, `QR_CODE_IMAGE_URL`, `PAYMENT_UPI_ID`, `ADMIN_INVITE_CODE`)
- `backend/deps.py` — `get_current_user` / `require_role()` dependencies, verify Supabase Auth bearer tokens via a direct REST call (see gotcha below)
- `backend/schemas.py` — pydantic request models
- `backend/routers/` — `auth.py` (signup/login/me), `logs.py` (surplus logs + photo upload to Supabase Storage), `marketplace.py` (listings + NGO claims), `admin.py` (NGO verification queue, subscribers, rescues), `billing.py` (plans, QR payment submit/approve)
- `backend/supabase_schema.sql` — table definitions to run once in the Supabase SQL editor (`profiles`, `surplus_logs`, `marketplace_listings`, `claims`, `subscriptions`)
- Hosting: needs a Python host regardless of payment choice (Supabase doesn't run custom FastAPI code) — deployed on Render.
- Admin signup requires `ADMIN_INVITE_CODE` (server-side checked) — without this, self-signup as admin would be wide open on a public API, unlike the old frontend-only mock where the "invite code" field was cosmetic.

### Gotcha found via full integration testing (fixed)
`supabase-py`'s shared client is a **module-level singleton** reused across every request. Calling `.auth.sign_in_with_password()` or `.auth.get_user()` **on that shared client mutates its session**, which then makes every subsequent `.table()` call in the whole running process execute as that logged-in user instead of the service role — silently breaking RLS-bypass server-wide (all tables have RLS enabled with zero policies, so this manifested as "0 rows" / random empty results for *other* requests too, not just the one that logged in). Fixed by doing login and token verification as **plain `httpx` REST calls** to Supabase's auth endpoints directly (`routers/auth.py` `/login`, `deps.py` `get_current_user`), never touching `.auth.*` methods on the shared `config.supabase` client. If any future endpoint is tempted to call `supabase.auth.sign_in_with_password`/`set_session`/`sign_up` (non-admin) on the shared client, don't — same bug will resurface.
Also hit: `subscriptions` has two FKs to `profiles` (`restaurant_id`, `verified_by`), so PostgREST's auto-embed `profiles(...)` is ambiguous — must disambiguate as `profiles!subscriptions_restaurant_id_fkey(...)` (done in `admin.py` and `billing.py`).

## Frontend (Session 4 — wired to real backend)
- `frontend/src/lib/api.js` — fetch wrapper (`REACT_APP_BACKEND_URL` env var, default `http://localhost:8000`), holds the bearer token in localStorage, one method per backend endpoint.
- `App.js`: real signup/login (Supabase-backed), session restored on page refresh via `/auth/me`, real surplus-log create + optional photo upload, real marketplace listing creation ("List surplus" button), real NGO claim + confirm-pickup, real admin verification/payments/subscribers/rescues (replaced the old hardcoded fake KPI numbers/growth chart with real counts from the API).
- Removed the old "instant fake portal access" shortcuts (hero/pricing "Start free trial", footer login buttons, LoginModal's NGO/Admin "explore a demo" buttons) since they'd bypass auth entirely against a now-real backend — everything routes through real signup/login now.
- Frontend fields not covered by the backend schema (dish category, waste reason, use-by date, freshness status, dietary type) are folded into the log's `notes` string rather than requiring a schema/DB migration — see the log table's `reason` column showing the combined string instead of separate "category · reason".
- Verified end-to-end against the real Supabase project (signup/login for all 3 roles, admin-invite-code gate, log→listing→claim→pickup→rescue flow, verification approve, billing submit→pending→approve) before pushing; test data cleaned up afterward.
- Still needed: set `REACT_APP_BACKEND_URL` in Vercel's env vars to the Render URL, then redeploy (env var changes don't trigger a rebuild by themselves).
- Render free tier spins down after ~15 min idle; first request after that takes 30-60s and can surface as a raw "Load failed" in the browser. Mitigated two ways: `.github/workflows/keep-alive.yml` pings `/api` every 10 min, and `lib/api.js`'s `request()` retries up to 3x (4s/8s/15s backoff) on a network-level fetch failure before giving up.
- Dashboard greeting is time-of-day aware (`getGreeting()` in App.js), computed from `Asia/Kolkata` specifically regardless of the visitor's device timezone.

## Frontend (Session 5 — About/Terms placeholders, signup role dropdown, full Hindi translation)
- `AboutSection`/`TermsModal` replaced with blank placeholders (kicker + "content coming soon") — real design coming from a teammate separately, not built by this agent.
- `SignupModal` now has an internal role dropdown (`t.iAmA` + `<select>`) instead of being hardwired per-button to a fixed role/copy set — one unified interactive form. `LoginModal`'s three separate per-role signup links collapsed into one generic "Sign up" link.
- Hindi translation: the landing page had **zero** `t.xxx` wiring despite a working toggle — every string was hardcoded English. That was almost certainly the actual "Hindi doesn't work" complaint, not a toggle bug. Added ~316 translation keys (`copy.en`/`copy.hi`, both same key count, verified via a Node script cross-check of every `t.xxx` reference in the file) covering: full landing page, all portal pages, RestaurantTools/InventoryWatch/ExpiryWatch/WastePlaybook, auth modals, sidebar/topbar chrome. `<select>` option lists are now `[englishValue, translatedLabel]` pairs so the displayed language never changes what's actually stored/sent to the backend.
- Deliberately NOT translated: toast messages (transient, high volume, lower priority — flagged in PRD backlog), and data values themselves (partner names, listing priority levels, etc.).

## Session 6 — rebrand + remove all fabricated/demo data
- Renamed "Wastelytics" → "Fedd" everywhere: brand text, page title/meta (`index.html`, which was still the unedited Emergent scaffold default this whole time — never actually said "Wastelytics" in the browser tab), founder story, Terms & Conditions, backend API title, localStorage key prefix, CSV export filename, admin invite code placeholder hint.
- Also removed the Emergent PostHog analytics script from `index.html` — it was sending real visitor session data to Emergent's own PostHog project (`ap.emergent.sh`) this whole time, orphaned and inappropriate now that the app is fully independent.
- Support email → `feddsupport@gmail.com` (Terms & Conditions contact section).
- Removed all fabricated marketing/demo data since this is now a real, pre-launch business with zero real customers: deleted `PartnerMarquee` (fake scrolling logo wall), `PartnerNetwork` (fake customer testimonial cards with invented impact stats), the hero's fake "₹24,680 saved / 18.4% less waste" stat ticket + fake "RM ST AK" social-proof avatars, `RestaurantTools`' fake "12% below peers" benchmark card and fake multi-outlet selector (Andheri West/Bandra East/Powai), `NgoMapPage`'s fabricated per-listing distance/time numbers, and one of the three `ImpactFacts` stats that was a fabricated "sample kitchen... demo estimate" (kept the two properly-sourced general industry facts — UNEP, industry estimate — since those aren't company-specific claims).
- `InventoryWatch` and `ExpiryWatch` had zero backend (always local-only, seeded with fake Paneer/Basmati rice/Garlic naan items) — now start genuinely empty with real empty-state messaging; InventoryWatch also got a real (if still local-only) "add item" form so it's not just a dead empty box.
- `WastePlaybook` had a hardcoded `|| ["Paneer tikka", 18]` fallback that showed a fake recommendation to brand-new accounts with zero real logs — now shows a genuine empty state instead.
- Fixed landing page pricing (was hardcoded ₹100/₹200, didn't match the real backend `PLANS` in `billing.py` which are ₹999/₹2,499) — now consistent.
- Cleaned up ~22 translation keys that went dead from these removals (verified via the same en/hi key-parity script used throughout this project).

## Code Architecture
- `/app/frontend/src/App.js` — monolithic; all portals/components, now calling the real backend via `src/lib/api.js`
- `/app/frontend/src/App.css` — full styles + animations (marquee, dark mode tokens)
- `/app/backend/server.py` — wires up `auth`, `logs`, `marketplace`, `admin`, `billing` routers under `/api`
