# CivicTree Demo MVP

CivicTree is a polished demo MVP for a civic task marketplace. It shows the full loop from finding neighborhood work to claiming a task, checking in, submitting proof, admin approval, worker earnings, and sponsor/city impact.

The demo is intentionally database-free. State is seeded deterministically, persisted in `localStorage` with a versioned Zustand store, and can be restored with the development bar's `Reset demo` control.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

No environment variables, database, SMS provider, payment provider, object storage, or map service are required for the demo flow.

## Verification

```bash
npm run test
npm run build
npm run test:e2e
```

`npm run test:e2e` runs the full Playwright story against a production build on `127.0.0.1:3100`.

## Demo Personas

Use the development bar on app routes to switch personas:

- `Worker (Austin)`: completed onboarding, open tasks, seeded earnings.
- `Admin`: reviews submitted proof, approves or rejects payouts, creates tasks.
- `Sponsor`: views campaign and outcome surfaces.
- Seed data also includes `Maya` as a new worker and `Jordan` as a worker profile used by the map UI.

## Key Routes

- `/`: scrollable marketing homepage for workers, sponsors, and city partners.
- `/pitch`: pitch welcome, walkthrough, and demo home.
- `/worker/map`: functional task map with filters, distance labels, status-aware pins, and claim entry.
- `/worker/task/[id]`: task detail with claim gating for unavailable or funding-needed work.
- `/worker/task/[id]/claim`: safety checklist before claiming.
- `/worker/task/[id]/active`: check-in, sample proof photos, and submission.
- `/worker/today`: worker home state based on onboarding, active claims, pending reviews, and campaign progress.
- `/worker/earn`: balances, pending review rows, payout history, and demo cash out.
- `/worker/report`: local report submission.
- `/admin/submissions`: proof review queue.
- `/admin/tasks/create`: store-backed task creation.
- `/dashboard`: store-backed command center.
- `/sponsor`: campaign funding pool, percent complete, payout totals, and proof thumbnails.
- `/for-cities`: neighborhood impact rollup.

## Demo State

The demo store lives in `src/lib/demo`. Pure seed, selector, and reducer logic is covered by Vitest. The store persists entity state under a versioned `localStorage` key and drops old persisted state on version changes.

Proof images are stored as base64 data URLs or seeded local image URLs so the loop survives refresh without object storage.

## Production Path

The repo still includes dormant Prisma and API code as a starting point for production:

- Replace the Zustand-only store with Postgres and Prisma-backed persistence.
- Replace base64 proof with object storage and signed URLs.
- Replace demo persona switching with real auth and sessions.
- Replace dormant SMS routes with a real OTP provider such as Twilio.
- Replace demo cash out with Stripe Connect or another payout rail.
- Replace the CSS map with real geocoding, map tiles, and location permissions.
