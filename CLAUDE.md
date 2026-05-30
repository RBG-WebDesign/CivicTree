# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CivicTree is a two-sided marketplace: **workers** earn money completing local civic tasks (cleanup, repair, verification), and **admins/sponsors** create tasks, review submissions, and process payouts. The DB is SQLite via Prisma; auth is OTP-based but Twilio is not integrated.

## Commands

```bash
npm run dev      # Dev server (webpack — Turbopack disabled due to Prisma adapter)
npm run build    # Production build
npm run lint     # ESLint

# Database
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma db push           # Apply schema to SQLite without migration files
npx prisma db seed           # Seed with test users, campaigns, tasks
npx prisma studio            # Browse DB in browser
```

No test suite exists.

## Architecture

### Stack

- **Next.js 16 / React 19** — App Router only
- **Prisma + SQLite** — schema at `prisma/schema.prisma`, client generated to `src/generated/prisma/`
- **Tailwind CSS v4** — custom `@theme` tokens in `src/app/globals.css`, no `tailwind.config.js`
- **TypeScript strict mode** — path alias `@/*` → `src/*`

### Key User Flows

```
Worker:   Sign In (OTP) → Onboarding → Today → Map → Claim → GPS Checkin → Submit (photos+notes) → Review → Payment
Admin:    Admin Submissions → Review → Approve/Reject → Payment status updated
```

### Directory Map

```
src/
├── app/
│   ├── api/            # Route handlers
│   │   ├── auth/       # send-code, verify-code (OTP — Twilio stubbed)
│   │   ├── tasks/      # GET/POST tasks, [id]/claim, [id]/checkin, [id]/submit
│   │   ├── claims/     # GET claims by workerId+taskId
│   │   ├── submissions/# [id] GET/PATCH, [id]/review POST
│   │   ├── users/      # [id] GET/PATCH
│   │   ├── payouts/    # cashout POST, onboard POST (Stripe stubbed)
│   │   ├── reports/    # POST report
│   │   └── upload/     # POST file (saves to public/uploads/, logs fake S3 URL)
│   ├── worker/         # Worker app pages
│   │   ├── today/      # Dashboard — dynamic state-driven primary card
│   │   ├── map/        # Task browser — desktop + mobile view toggle
│   │   ├── task/[id]/  # Task detail, claim page, active workspace
│   │   ├── earn/       # Earnings + payment history
│   │   ├── report/     # Submit a new report
│   │   ├── profile/    # Worker profile
│   │   ├── onboarding/ # New user onboarding flow
│   │   └── training/   # Safety training
│   ├── admin/          # Admin pages
│   │   ├── submissions/# Queue + individual review
│   │   └── tasks/create# Task creation form
│   ├── dashboard/      # Desktop command center (gamified LA neighborhood map)
│   ├── pitch/          # Interactive investor/stakeholder pitch demo (also serves as /)
│   └── ...             # Marketing pages: how-it-works, for-cities, sponsor, earn, dtla-pilot, signin
├── components/         # Shared UI: Header, Footer, WorkerNav, RoleSwitcher, CashoutButton, CivicTreeLogo
└── lib/
    └── prisma.ts       # Singleton Prisma client
```

### Database Models

`User` · `Task` · `Claim` · `Submission` · `Review` · `Payment` · `Campaign` · `Report`

Status flows:
- Task: `open → claimed → submitted → approved/rejected`
- Claim: `claimed → in_progress → submitted → completed`
- Payment: `pending_review → available → paid`
- Report: `pending → approved_paid | approved_funding | city_routed | rejected`

### Auth & Role Switching

Production auth: cookie-based OTP (Twilio not integrated — code logs to console). For local dev, a **RoleSwitcher dev bar** (rendered globally at the top of every page) sets cookies directly:

- Worker (Austin, experienced): `civictree_role=worker; civictree_user_id=worker-austin-id`
- Worker (Maya, new/needs onboarding): `civictree_user_id=worker-new-id`
- Worker (Jordan, no tasks nearby): `civictree_user_id=worker-notasks-id`
- Admin: `civictree_role=admin; civictree_user_id=admin-id`

API routes read `civictree_user_id` and `civictree_role` from cookies — there is no JWT or session system.

### Seeded Test Data

`prisma/seed.js` creates: 1 campaign (Broadway Block Reset), 4 users (3 workers + 1 admin), 7 open tasks, and 3 historical task+claim+submission+payment records for `worker-austin-id` establishing his $24 available / $18 pending balance.

---

## What Is Complete vs What Is Stubbed

### Complete and Working
- Pitch/demo experience at `/` — interactive investor demo with worker/admin/sponsor walkthroughs
- Worker Today — fully dynamic, 4 state variants driven by DB (onboarding needed, no tasks nearby, active claim, pending review)
- Worker Map — desktop + mobile views, task list, filter chips, CSS map mockup with task pins
- Worker Task Detail (`/worker/task/[id]`) — loads from DB, do/don't lists, claim CTA
- Worker Active Workspace (`/worker/task/[id]/active`) — GPS checkin, before/after photo upload (saves to `public/uploads/`), submission
- Worker Earn — payment history from DB, cashout button
- Worker Report — category picker, GPS sim, submits to DB
- Admin Submissions queue + individual review — approve/reject writes Review row, updates Payment status
- Admin Task Create — form POSTs to `/api/tasks`
- Desktop Command Center (`/dashboard`) — gamified LA neighborhood map with admin stats
- All core API routes function end-to-end with SQLite

### Stubs / Incomplete

| Feature | Location | Status |
|---|---|---|
| Twilio SMS OTP | `api/auth/send-code`, `api/auth/verify-code` | Code generated and logged to console; never sent via SMS |
| Real auth session | `app/signin/page.tsx` | Signs in by setting cookies directly; no Twilio, no session persistence |
| Stripe Connect | `api/payouts/cashout`, `api/payouts/onboard` | Marks payments `paid` in DB; logs fake transfer; no real Stripe calls |
| Cloud photo storage | `api/upload/route.ts` | Files saved to `public/uploads/` locally; logs fake S3 URL; no real bucket |
| Real map | `worker/map/page.tsx` | All maps are CSS/HTML mockups; no Mapbox or Google Maps |
| Real GPS distance | `worker/map/page.tsx` | Distance shown as hardcoded "0.{n} mi away"; not calculated from coordinates |
| Activity feed | `worker/today/page.tsx` | "Today in DTLA" section has 4 hardcoded strings, not from DB |
| Notification bell | `worker/map/page.tsx` header | Hardcoded badge count of 3 |

### Completion Priority (to make the full flow work end-to-end)

1. **Wire onboarding to set `onboardingCompleted: true`** — the DB field drives the worker's Today card variant; this must write back to DB
2. **Replace hardcoded activity feed** in `worker/today` with real recent-approvals query
3. **Photo storage** — swap `public/uploads/` for Vercel Blob or Cloudinary for deployment
4. **Twilio** — add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` env vars and one API call in `send-code`
5. **Stripe** — wire Stripe Connect into the cashout flow
6. **Real map** — integrate Mapbox GL or Leaflet to replace CSS map mockups
