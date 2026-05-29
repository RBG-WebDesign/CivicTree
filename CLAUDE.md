# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CivicTree is a two-sided marketplace built on Next.js (App Router): **workers** earn money completing local civic tasks (cleanup, repair, verification), and **admins/sponsors** create tasks, review submissions, and process payouts. The DB is SQLite via Prisma; auth is OTP-based but not yet Twilio-integrated.

## Commands

```bash
npm run dev      # Dev server (Turbopack)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint

# Database
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma db push           # Apply schema to SQLite without migration files
npx prisma db seed           # Seed with test users, campaigns, tasks
npx prisma studio            # Browse DB in browser
```

No test suite exists yet.

## Architecture

### Stack

- **Next.js 16 / React 19** — App Router only (no Pages Router)
- **Prisma + SQLite** — schema at `prisma/schema.prisma`, client generated to `src/generated/prisma/`
- **Tailwind CSS v4** — custom `@theme` tokens in `src/app/globals.css`, no `tailwind.config.js`
- **TypeScript** — strict mode; path alias `@/*` → `src/*`

### Key Flows

```
Worker:   Sign In (OTP) → Onboarding → Browse Tasks → Claim → GPS Checkin → Submit (photos+notes) → Review → Payment
Admin:    Create Campaign/Tasks → Review Submissions → Approve/Reject → Payouts
```

### Directory Map

```
src/
├── app/
│   ├── api/            # Route handlers — auth, tasks, claims, submissions, users, payouts, reports, upload
│   ├── worker/         # Worker app pages (today, earn, map, profile, onboarding, task/[id], training, report)
│   ├── admin/          # Admin pages (submissions, tasks/create, workers/[id])
│   └── ...             # Marketing pages (how-it-works, for-cities, sponsor, earn, dtla-pilot, signin)
├── components/         # Shared UI (Header, Footer, WorkerNav, RoleSwitcher, CashoutButton)
└── lib/
    └── prisma.ts       # Singleton Prisma client
```

### Database Models

`User` · `Task` · `Claim` · `Submission` · `Review` · `Payment` · `Campaign` · `Report`

Status flows: Claim `claimed → submitted → completed`; Payment `pending_review → available → paid`

### Auth & Role Switching

Production auth is cookie-based OTP (Twilio not integrated). For local dev, a **RoleSwitcher dev bar** sets cookies directly:

- Worker: `civictree_role=worker; civictree_user_id=worker-austin-id`
- Admin: `civictree_role=admin; civictree_user_id=admin-id`

No JWT or persistent session system exists yet — API routes read role/user from cookies.

### Incomplete Integrations

- **Twilio SMS** — OTP code is stored in an in-process memory cache, never sent
- **Stripe Connect** — `/api/payouts/` routes are stubs
- **Photo storage** — `/api/upload/` present but no cloud storage wired
