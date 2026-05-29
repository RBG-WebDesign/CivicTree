# CivicTree Database-Free Demo MVP — Design

Date: 2026-05-29
Status: Approved architecture, pending user spec review

## Goal

Make CivicTree a polished, demo-ready MVP that proves the full civic task loop end to end on localhost with **no database, no external services, and no broken primary flows**. A worker finds a task on a functioning map, claims it, completes it with proof; an admin reviews it; and worker earnings plus sponsor/city impact reflect the outcome — all from one consistent, deterministic, client-side demo state that persists across a browser session and can be reset.

## Resolved Contradiction

The brief contains conflicting guidance (one half says "keep SQLite and update the database consistently"; the other says "no database, bypass Prisma, prefer client-side state"). The `/goal` definition of done is the operative instruction: **database-free, client-side demo**. The DB-backed code is kept but dormant.

## Architectural Decisions

1. **Prisma stays dormant.** `prisma/`, the generated client, `seed.js`, and the `/api/*` route handlers remain in place but are not used by the demo flow. They document the future production path. Nothing is deleted (respects "do not remove unrelated files").
2. **Zustand + persist middleware** is the shared demo store. Added as a dependency. State persists to `localStorage` under a versioned key. **Lifecycle: the demo state persists across refreshes and new tabs until the visible Reset demo control restores the deterministic seed.** `localStorage` (not `sessionStorage`) is chosen deliberately so an accidental refresh during a pitch does not wipe progress.
3. **Deterministic seed.** No `Math.random()` in demo data. Stable IDs so pages stay consistent and refresh does not change data.
4. **Brand and visual direction preserved.** Civic green tokens in `globals.css`, Outfit/Plus Jakarta Sans, existing pitch/dashboard/worker aesthetics all kept.

## Store Shape

`src/lib/demo/`

- `types.ts` — `Worker`, `Admin`, `Sponsor`, `City`, `Neighborhood`, `Task`, `Report`, `Claim`, `Submission`, `Payment`, `Campaign`. Status unions match the existing Prisma semantics (Task `open|claimed|in_progress|submitted|approved|rejected`, Payment `pending_review|available|paid|rejected`, Report `pending|approved_paid|approved_funding|city_routed|rejected`).
- `seed.ts` — `createSeedState()` returns the full initial graph: cities (LA neighborhoods with impact stats), one+ campaigns, sponsors, the 3 worker personas + admin, ~8 tasks across statuses, seeded reports, and Austin's historical claims/submissions/payments establishing his balances.
- `store.ts` — Zustand store with `persist`. Holds the entity collections plus the active demo identity (current worker/admin/sponsor). Versioned (`version` + `migrate`/clear-on-mismatch). Actions:
  - `claimTask(taskId, workerId)` → task `open→claimed`, create `Claim` `claimed`.
  - `checkInTask(claimId, coords)` → claim `claimed→in_progress` **and task `claimed→in_progress`** (kept in lockstep so map cards and admin surfaces never show a status mismatch), store gps.
  - `submitProof(claimId, { beforePhoto, afterPhoto, notes })` → create `Submission` `submitted`, claim `→submitted`, task `→submitted`, create `Payment` `pending_review`. Proof images are stored as **base64 data URLs** (see below) so they survive refresh.
  - `reviewSubmission(submissionId, 'approve'|'reject', { reason, approvedAmount })`:
    - **Approve** → submission `approved`, payment `available`, task `approved`, claim `completed`; bump campaign `completedGoal`, decrement `remainingBudget`, roll up neighborhood impact (tasks completed, paid total, blocks improved).
    - **Reject** → submission `rejected`, payment `rejected`, task `rejected`, claim stays `submitted`, store the reason. No resubmission in the demo (a future version can reopen the task); impact and balances are unaffected.
  - `cashOut(workerId)` → `available` payments `→paid`.
  - `createReport(payload)` / `createTask(payload)` / `promoteReportToTask(reportId, payload)`.
  - `resetDemo()`.
- `selectors.ts` — pure derived helpers: `workerBalances(state, workerId)` (available/pending/lifetime), `neighborhoodImpact`, `campaignProgress`, `haversineMiles(a, b)` for real "0.x mi away", `tasksForMap(filter)`.
- `hooks.ts` — typed `useDemoStore` selectors and an SSR-safe hydration guard so persisted state does not cause hydration mismatches (store reads happen after mount).

## Page Changes

- **Server components → client components** where they read demo state: `worker/today`, `worker/earn`, `admin/submissions`. They lose Prisma/cookie reads and use store hooks. (Confirm Next 16 client-component + persisted-store hydration pattern against `node_modules/next/dist/docs` before converting.)
- **`worker/map`** becomes the functional marketplace: pin ↔ list card ↔ detail are synced through store selection; filters operate on store tasks; pins recolor by status; user-location marker from a fixed demo coordinate; desktop/mobile toggle retained. Claim links route into the claim/active flow.
- **`worker/task/[id]` + `/claim` + `/active`** drive `claimTask` → `checkInTask` → `submitProof`. Proof upload reads the chosen file and converts it to a **base64 data URL** (via `FileReader.readAsDataURL`) before storing, so thumbnails survive a refresh. If no file is chosen, a seeded placeholder image is used. No server upload.
- **`admin/submissions` + `[id]`** drive `reviewSubmission`; queue and stats derive from store.
- **`admin/tasks/create`** uses `createTask`.
- **Sponsor / city / dashboard** read the same store for completed tasks, paid totals, proof thumbnails, and block impact.
- **Public routes** (`/`, `/earn`, `/for-cities`, `/sponsor`, `/how-it-works`, `/dtla-pilot`) audited for consistent nav, working CTAs (`Find tasks near me`→`/worker/map`, `Sponsor a block`→`/sponsor`, `How it works`→pitch walkthrough). Internal nav uses `next/link`; icons from `lucide-react`.
- **The investor Welcome intro is preserved.** `/` keeps the existing `PitchExperience` flow starting at the `welcome` stage, then `story`, then the product `home` hub. This intro is a required part of the demo for investors and must not be removed or bypassed. The "Enter CivicTree Demo" path from the walkthrough leads into the live store-backed product surfaces.

## Demo Route Matrix

| Route | Primary action | Expected state update |
|---|---|---|
| `/` | Begin → walkthrough → Enter Demo | None (intro); routes into product |
| `/worker/map` | Select pin/card; Claim task | Selected task syncs; Claim → task `open→claimed`, new claim |
| `/worker/task/[id]` | Claim this task | task `open→claimed`, claim created |
| `/worker/task/[id]/claim` | Confirm claim → start | Routes to active workspace |
| `/worker/task/[id]/active` | Check in, upload before/after, submit | claim+task `→in_progress`, then `→submitted`; payment `pending_review` |
| `/worker/earn` | View balances; Cash out | Cash out: `available`→`paid`; balances recompute |
| `/worker/today` | Dynamic next-step card | Reflects active claim / pending review from store |
| `/admin/submissions` | Open a queued submission | Lists store submissions `submitted`; stats derive from store |
| `/admin/submissions/[id]` | Approve / Reject | Approve: submission/task/payment/claim + impact + campaign update. Reject: submission/task/payment `rejected`, reason stored |
| `/admin/tasks/create` | Create task | New `open` task added to store, appears on map |
| `/sponsor` | View sponsored campaign impact | Reads completed tasks, demo budget paid, proof, block impact from store |
| `/for-cities` | View city impact | Reads neighborhood impact rollups from store |
| `/dashboard` | Command center overview | Reads neighborhood/task/payment rollups from store |
| `/dtla-pilot` | Pilot marketing + CTA | Static; CTAs route to demo flows |

## Persona Switching

The dev bar switches the active demo identity instantly and deterministically (no reload-driven data change beyond re-rendering for the new identity):

- **Worker (Austin)** — sees his own claims, submissions, and earnings; worker nav and worker actions.
- **Admin** — sees all submissions across workers, review and task-creation actions, command center.
- **Sponsor** — sees campaign/funding-pool impact for sponsored work (read-only outcome view).

Persona switching changes the visible role, nav, task ownership, and available actions. It does not grant a worker admin actions or vice versa. The Reset demo control also lives in the dev bar.

## Sponsor / City Language

There is no real money movement. Sponsor and city surfaces use "demo budget," "sponsored budget," or "funding pool" framing and label simulated payout totals as part of the demo loop, never as actual disbursed funds.

## UX Rules

- No `alert()`. Replace with inline status UI / lightweight toast.
- No dead buttons: every primary action works, updates state, opens a clear demo modal, or is removed.
- Demo-only behavior labeled subtly (e.g. a "Demo" chip and the Reset control) without breaking immersion.
- A **Reset demo** control (in the dev bar) calls `resetDemo()`.
- No em dashes in UI copy.

## Phasing

1. Store foundation: deps, `types`, `seed`, `store`, `selectors`, `hooks`, Reset control. Build.
2. Worker marketplace: functional map (selection, filters, status colors, distance, location). Build + Playwright pin/filter checks.
3. Worker loop: claim → check-in → proof → submission via store; inline status, no alerts. Build + Playwright claim/submit.
4. Admin loop: review approve/reject updates task/payment/impact/campaign; task create. Build + Playwright review.
5. Outcome surfaces: worker earnings, sponsor/city/dashboard impact all reflect store. Build.
6. Public route + responsive polish: CTAs, nav, mobile/desktop clipping, console errors. Build + Playwright public pages + full loop + reset.
7. Docs: project README, env/personas/routes/limitations, production-path notes (Postgres + object storage + Twilio + Stripe). Final punch list.

## Acceptance Criteria

1. A worker can start at the homepage, go through the Welcome intro, click **Find tasks near me**, select a task on the map, claim it, check in, submit proof, and see the task move to pending review.
2. An admin can open submissions, approve the worker's proof, and cause the worker's pending balance to become available while campaign, sponsor, and neighborhood impact metrics update.
3. The sponsor page reflects the approved work with updated tasks completed, demo dollars paid, proof thumbnails, and block impact.
4. Reject moves the submission, payment, and task to `rejected` with a visible reason, and leaves balances and impact unchanged.
5. Reset demo restores every seeded task, claim, payment, submission, report, campaign, neighborhood impact stat, and persona to its original state.
6. After a page refresh, claimed/submitted/approved state and proof thumbnails persist (until Reset demo).

## Verification

After each phase: lint touched files, `npm run build`, Playwright on the relevant step. Final Playwright run covers the full loop: home CTA → map filter + pin select → claim → submit proof → admin approve → earnings update → sponsor/city impact update → reset restores seed. Check desktop and mobile viewports for clipping, overlap, broken links, console errors, and framework overlays.

## Out of Scope (intentional demo-only)

Real auth/session, Twilio SMS, Stripe payouts, cloud object storage, real map tiles (Mapbox/Leaflet), real geolocation accuracy. All documented in the handoff punch list with the production path.
