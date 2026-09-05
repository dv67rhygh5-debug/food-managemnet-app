# Wastelytics — PRD

## Original Problem Statement
Build a responsive, interactive web frontend for "Wastelytics" — a subscription-based analytics platform helping restaurants track, understand, and reduce food waste, with an integrated NGO marketplace for surplus food redistribution as a secondary feature. Clean B2B SaaS aesthetic, dark mode, English/Hindi toggle, three portals (Restaurant / NGO / Admin), and rich mocked workflows in local React state.

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
### P1
- Extend Hindi translation to inline strings inside RestaurantTools, InventoryWatch, ExpiryWatch, WastePlaybook, AdminPage, LogPage form section titles
- Localize NGO filter chip labels using `t.filterHigh/filterVeg/filterCold`
- Wire frontend to the new backend (replace localStorage/mock state with real API calls)
### P2
- Split monolithic `App.js` into `pages/` and `components/` folders
- Real photo upload UI (backend endpoint already exists — see below)

## Payment approach (decided)
No payment gateway (Razorpay/Stripe explicitly excluded). Restaurants scan a static QR code (own UPI/bank QR) and submit a reference note; an admin manually approves/rejects via the billing endpoints. See `backend/routers/billing.py`.

## Known Mocked
Frontend is still fully mocked (React state + localStorage) — backend below is real but not yet wired up to it.

## Backend (Session 4 — added)
- Stack: FastAPI + **Supabase** (Postgres + Supabase Auth + Supabase Storage). MongoDB/motor removed.
- `backend/config.py` — env/config + Supabase client (placeholders in `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_STORAGE_BUCKET`, `QR_CODE_IMAGE_URL`, `PAYMENT_UPI_ID`)
- `backend/deps.py` — `get_current_user` / `require_role()` dependencies, verify Supabase Auth bearer tokens
- `backend/schemas.py` — pydantic request models
- `backend/routers/` — `auth.py` (signup/login/me), `logs.py` (surplus logs + photo upload to Supabase Storage), `marketplace.py` (listings + NGO claims), `admin.py` (NGO verification queue, subscribers, rescues), `billing.py` (plans, QR payment submit/approve)
- `backend/supabase_schema.sql` — table definitions to run once in the Supabase SQL editor (`profiles`, `surplus_logs`, `marketplace_listings`, `claims`, `subscriptions`)
- Hosting: needs a Python host regardless of payment choice (Supabase doesn't run custom FastAPI code) — Render recommended.
- Not yet done: installing/testing deps against a real Supabase project, wiring the frontend to these endpoints, RLS policies beyond "enabled + service-role bypass".

## Code Architecture
- `/app/frontend/src/App.js` — monolithic; contains all portals, components, mock data (not yet calling the backend)
- `/app/frontend/src/App.css` — full styles + animations (marquee, dark mode tokens)
- `/app/backend/server.py` — wires up `auth`, `logs`, `marketplace`, `admin`, `billing` routers under `/api`
