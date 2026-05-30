# CivicTree Database-Free Demo MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make CivicTree a polished, demo-ready MVP that runs the full civic-task loop (find → claim → check in → submit proof → admin review → earnings + sponsor/city impact) entirely from a deterministic, persisted, client-side store with no database or external services.

**Architecture:** A Zustand store (`persist` to `localStorage`, versioned, resettable) holds all demo entities seeded deterministically. Pages that previously read Prisma become client components reading the store via SSR-safe hooks. Prisma and the `/api/*` routes stay in the repo but dormant. The investor Welcome intro on `/` is preserved.

**Tech Stack:** Next.js 16.2.6 (App Router, webpack), React 19, TypeScript strict, Tailwind v4, lucide-react, Zustand (new), Vitest (new, store logic only), Playwright (verification).

**Spec:** `docs/superpowers/specs/2026-05-29-civictree-demo-mvp-design.md`

**Verification model:** Store logic (pure reducers/selectors) is unit-tested with Vitest (TDD). Page wiring is verified by `npm run build` (type safety across the conversion) plus Playwright behavior checks. Lint touched files with `npx eslint <files>`.

---

## File Structure

**New files:**
- `src/lib/demo/types.ts` — all entity + state TypeScript types and status unions.
- `src/lib/demo/constants.ts` — `DEMO_USER_LOCATION`, `STORE_VERSION`, `STORE_KEY`, placeholder image paths.
- `src/lib/demo/seed.ts` — `createSeedState()` returns the full deterministic entity graph.
- `src/lib/demo/reducers.ts` — pure functions that take `DemoState` + args and return the next `DemoState` (claim, checkIn, submitProof, reviewSubmission, cashOut, createReport, createTask, promoteReportToTask). Pure = unit-testable without React.
- `src/lib/demo/selectors.ts` — pure derived helpers (`workerBalances`, `campaignProgress`, `neighborhoodImpact`, `haversineMiles`, `taskDistanceMiles`, `filterTasks`).
- `src/lib/demo/store.ts` — Zustand store wiring `persist` + the reducers as actions + `setPersona` + `resetDemo`.
- `src/lib/demo/hooks.ts` — `useHydrated()` SSR guard + convenience selector hooks.
- `src/components/demo/DemoControls.tsx` — Reset demo button (used in dev bar).
- `src/components/demo/Toast.tsx` — lightweight toast/inline status provider replacing `alert()`.
- `src/lib/demo/__tests__/reducers.test.ts`, `selectors.test.ts`, `seed.test.ts` — Vitest unit tests.
- `vitest.config.ts` — Vitest config.
- `tests/e2e/demo-loop.spec.ts` — Playwright full-loop spec.
- `README.md` — replace boilerplate (Phase 7).

**Modified files (data source swap, UI preserved):**
- `src/components/RoleSwitcher.tsx` — drive persona from store, add Sponsor, mount DemoControls.
- `src/app/worker/today/page.tsx`, `worker/earn/page.tsx` — server → client, read store.
- `src/app/worker/map/page.tsx` — store-backed tasks, real selection/filter/distance/status colors.
- `src/app/worker/task/[id]/page.tsx`, `/claim/page.tsx`, `/active/page.tsx` — store actions, base64 proof, no alerts.
- `src/app/worker/report/page.tsx` — `createReport`.
- `src/app/admin/submissions/page.tsx`, `submissions/[id]/page.tsx` — store, review actions.
- `src/app/admin/tasks/create/page.tsx` — `createTask`.
- `src/app/sponsor/page.tsx`, `for-cities/page.tsx`, `dashboard/page.tsx` — read store impact.

---

## Phase 0: Tooling

### Task 0.1: Add Zustand and Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install deps**

```bash
npm install zustand@^5
npm install -D vitest@^3
```

- [ ] **Step 2: Add a test script to package.json**

In `package.json` `scripts`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 4: Verify the runner starts**

Run: `npx vitest run`
Expected: exits 0 with "No test files found" (or runs zero tests). Confirms config loads.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add zustand and vitest for the demo store"
```

---

## Phase 1: Store Foundation

### Task 1.1: Types

**Files:**
- Create: `src/lib/demo/types.ts`

- [ ] **Step 1: Write the types**

```ts
export type Role = 'worker' | 'admin' | 'sponsor';

export type TaskStatus =
  | 'open' | 'claimed' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
export type ClaimStatus = 'claimed' | 'in_progress' | 'submitted' | 'completed';
export type SubmissionStatus = 'submitted' | 'approved' | 'rejected';
export type PaymentStatus = 'pending_review' | 'available' | 'paid' | 'rejected';
export type ReportStatus =
  | 'pending' | 'approved_paid' | 'approved_funding' | 'city_routed' | 'rejected';

export interface LatLng { lat: number; lng: number; }

export interface Worker {
  id: string; name: string; role: 'worker';
  onboardingCompleted: boolean; neighborhoodId: string;
  level: number; reliabilityScore: number; safetyScore: number;
  unlockedTaskTypes: string[];
}
export interface Admin { id: string; name: string; role: 'admin'; }
export interface Sponsor { id: string; name: string; role: 'sponsor'; campaignIds: string[]; }

export interface Neighborhood {
  id: string; name: string; state: string; level: number;
  tasksCompleted: number; paidTotal: number; blocksImproved: number;
  openReports: number;
}

export interface Campaign {
  id: string; title: string; description: string; sponsorId: string;
  targetGoal: number; completedGoal: number;
  totalBudget: number; remainingBudget: number;
}

export interface Task {
  id: string; title: string; description: string; status: TaskStatus;
  payoutAmount: number; estimatedMinutes: number;
  requiredTools: string[]; safetyNotes: string;
  doList: string[]; dontList: string[];
  location: LatLng; taskType: string;
  neighborhoodId: string; campaignId: string | null;
  isFundingNeeded: boolean; isComingSoon: boolean;
  reportedByUserId: string | null;
}

export interface Claim {
  id: string; taskId: string; workerId: string; status: ClaimStatus;
  claimedAt: string; startedAt: string | null; completedAt: string | null;
  gpsCheckin: LatLng | null;
}

export interface Submission {
  id: string; taskId: string; workerId: string; claimId: string;
  beforePhoto: string; afterPhoto: string; notes: string;
  status: SubmissionStatus; submittedAt: string;
  reviewReason: string | null;
}

export interface Payment {
  id: string; workerId: string; submissionId: string;
  amount: number; status: PaymentStatus; createdAt: string;
}

export interface Report {
  id: string; userId: string; photoUrl: string; location: LatLng;
  category: string; note: string; status: ReportStatus; createdAt: string;
}

export interface DemoState {
  workers: Worker[]; admins: Admin[]; sponsors: Sponsor[];
  neighborhoods: Neighborhood[]; campaigns: Campaign[];
  tasks: Task[]; claims: Claim[]; submissions: Submission[];
  payments: Payment[]; reports: Report[];
  activePersona: { role: Role; userId: string };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors from this file.

- [ ] **Step 3: Commit**

```bash
git add src/lib/demo/types.ts
git commit -m "feat(demo): add demo store entity types"
```

### Task 1.2: Constants

**Files:**
- Create: `src/lib/demo/constants.ts`

- [ ] **Step 1: Write constants**

```ts
import type { LatLng } from './types';

// Fixed demo user location (Downtown LA) used for deterministic distances.
export const DEMO_USER_LOCATION: LatLng = { lat: 34.0452, lng: -118.2502 };

export const STORE_KEY = 'civictree-demo';
export const STORE_VERSION = 1;

export const PLACEHOLDER_TASK_IMAGE = '/task_thumbnail.png';
export const PLACEHOLDER_PROOF_IMAGE = '/volunteers_working.png';

// Deterministic base time for demo records. Runtime records are stamped at
// DEMO_EPOCH + (sequence * 1 minute) so timestamps are stable, not wall-clock.
export const DEMO_EPOCH = Date.parse('2026-05-29T09:00:00.000Z');
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/demo/constants.ts
git commit -m "feat(demo): add demo constants and fixed user location"
```

### Task 1.3: Seed (deterministic) — test first

**Files:**
- Create: `src/lib/demo/seed.ts`
- Test: `src/lib/demo/seed.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { createSeedState } from './seed';

describe('createSeedState', () => {
  it('is deterministic across calls', () => {
    expect(createSeedState()).toEqual(createSeedState());
  });
  it('returns independent object graphs (no shared references)', () => {
    const a = createSeedState();
    a.tasks[0].status = 'approved';
    expect(createSeedState().tasks[0].status).toBe('open');
  });
  it('seeds the three worker personas and one admin', () => {
    const s = createSeedState();
    expect(s.workers.map((w) => w.id)).toEqual(
      expect.arrayContaining(['worker-austin-id', 'worker-new-id', 'worker-notasks-id']),
    );
    expect(s.admins[0].id).toBe('admin-id');
  });
  it('gives Austin $24 available, $12 paid, $18 pending in the seed', () => {
    const s = createSeedState();
    const ps = s.payments.filter((p) => p.workerId === 'worker-austin-id');
    const sum = (status: string) => ps.filter((p) => p.status === status).reduce((a, p) => a + p.amount, 0);
    expect(sum('available')).toBe(24);
    expect(sum('paid')).toBe(12);
    expect(sum('pending_review')).toBe(18);
  });
  it('seeds at least 6 open tasks', () => {
    expect(createSeedState().tasks.filter((t) => t.status === 'open').length).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Run, verify it fails**

Run: `npx vitest run src/lib/demo/seed.test.ts`
Expected: FAIL ("createSeedState is not a function" / module not found).

- [ ] **Step 3: Implement `seed.ts`**

Build `createSeedState()` returning a fresh `DemoState` literal each call (construct inside the function so no references are shared). Port the seed data from `prisma/seed.js`, adapted to the new types:
- `neighborhoods`: Downtown (Improving, lvl 3), South LA (Needs Care, lvl 1), Koreatown (Active, lvl 2), Venice (Thriving, lvl 4), Santa Monica (Fully Stewarded, lvl 4). Give Downtown `tasksCompleted: 128, paidTotal: 4200, blocksImproved: 18` to match the Broadway campaign framing.
- `sponsors`: one sponsor `sponsor-dtla` with `campaignIds: ['campaign-broadway']`.
- `campaigns`: `campaign-broadway` (Broadway Block Reset, targetGoal 100, completedGoal 42, totalBudget 5000, remainingBudget 3160, sponsorId 'sponsor-dtla').
- `workers`: austin (onboarding done, lvl 2, unlocked beginner/planter/verify, neighborhood Downtown), maya (onboarding false, lvl 1, beginner), jordan (onboarding done, lvl 1, beginner, neighborhood with no open tasks).
- `admins`: `admin-id`.
- `tasks`: the 7 open/spec tasks from the Prisma seed (litter-oak, water-broadway, sign-hazards, verify-planter, verify-trash-cleared, needs-funding, coming-soon) using `location`, `requiredTools`/`doList`/`dontList` as arrays, `neighborhoodId: 'downtown'`, `campaignId` where applicable. All use deterministic `createdAt` ISO strings (hardcode dates, never `Date.now()`).
- Austin's history: 3 tasks (hist-pending submitted, hist-approved approved, hist-paid approved) with matching claims (`submitted`/`completed`), submissions (`submitted`/`approved`/`approved`), and payments: hist-pending `pending_review` $18, hist-approved `available` $24, hist-paid `paid` $12. Use `PLACEHOLDER_TASK_IMAGE`/`PLACEHOLDER_PROOF_IMAGE` for photos.
- `reports`: report-trash-broadway (pending), report-graffiti-spring (city_routed).
- `activePersona: { role: 'worker', userId: 'worker-austin-id' }`.

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/demo/seed.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/demo/seed.ts src/lib/demo/seed.test.ts
git commit -m "feat(demo): deterministic seed state with tests"
```

### Task 1.4: Selectors — test first

**Files:**
- Create: `src/lib/demo/selectors.ts`
- Test: `src/lib/demo/selectors.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { createSeedState } from './seed';
import {
  workerBalances, campaignProgress, haversineMiles, taskDistanceMiles, filterTasks,
} from './selectors';
import { DEMO_USER_LOCATION } from './constants';

describe('selectors', () => {
  it('computes Austin balances from seed', () => {
    const b = workerBalances(createSeedState(), 'worker-austin-id');
    expect(b.available).toBe(24); // available to cash out (excludes already paid)
    expect(b.paid).toBe(12);
    expect(b.pending).toBe(18);
    expect(b.lifetime).toBe(54); // available + paid + pending
  });
  it('computes campaign progress percent', () => {
    expect(campaignProgress(createSeedState(), 'campaign-broadway')).toBe(42);
  });
  it('haversine of identical points is 0', () => {
    expect(haversineMiles(DEMO_USER_LOCATION, DEMO_USER_LOCATION)).toBe(0);
  });
  it('task distance is a small positive number for nearby tasks', () => {
    const s = createSeedState();
    const t = s.tasks.find((x) => x.id === 'task-litter-oak')!;
    const d = taskDistanceMiles(t);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(2);
  });
  it('filterTasks "quick" keeps only open tasks <= 20 min', () => {
    const s = createSeedState();
    const quick = filterTasks(s.tasks, 'quick');
    expect(quick.every((t) => t.status === 'open' && t.estimatedMinutes <= 20)).toBe(true);
  });
});
```

- [ ] **Step 2: Run, verify it fails**

Run: `npx vitest run src/lib/demo/selectors.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `selectors.ts`**

```ts
import type { DemoState, Task, LatLng } from './types';
import { DEMO_USER_LOCATION } from './constants';

export function workerBalances(state: DemoState, workerId: string) {
  const ps = state.payments.filter((p) => p.workerId === workerId);
  const sum = (status: string) =>
    ps.filter((p) => p.status === status).reduce((s, p) => s + p.amount, 0);
  const available = sum('available'); // available to cash out
  const paid = sum('paid');           // already cashed out
  const pending = sum('pending_review');
  const lifetime = available + paid + pending; // excludes rejected
  return { available, paid, pending, lifetime };
}

export function campaignProgress(state: DemoState, campaignId: string) {
  const c = state.campaigns.find((x) => x.id === campaignId);
  if (!c || c.targetGoal === 0) return 0;
  return Math.round((c.completedGoal / c.targetGoal) * 100);
}

export function haversineMiles(a: LatLng, b: LatLng) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 100) / 100;
}

export function taskDistanceMiles(task: Task, from: LatLng = DEMO_USER_LOCATION) {
  return haversineMiles(from, task.location);
}

export function filterTasks(tasks: Task[], filter: string) {
  return tasks.filter((t) => {
    if (filter === 'coming_soon') return t.isComingSoon;
    if (filter === 'funding') return t.isFundingNeeded;
    if (t.status !== 'open') return false;
    if (filter === 'quick') return t.estimatedMinutes <= 20;
    if (filter === 'highest_pay') return t.payoutAmount >= 20;
    if (filter === 'no_tools') return t.requiredTools.length === 0 || t.requiredTools.join().toLowerCase().includes('none');
    if (filter === 'verify') return t.taskType === 'verify';
    return true; // 'all'
  });
}

export function neighborhoodImpact(state: DemoState) {
  return state.neighborhoods.map((n) => ({ ...n }));
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/demo/selectors.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/demo/selectors.ts src/lib/demo/selectors.test.ts
git commit -m "feat(demo): pure selectors with tests"
```

### Task 1.5: Reducers — test first

**Files:**
- Create: `src/lib/demo/reducers.ts`
- Test: `src/lib/demo/reducers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { createSeedState } from './seed';
import {
  claimTask, checkInTask, submitProof, reviewSubmission, cashOut,
} from './reducers';
import { workerBalances } from './selectors';

const W = 'worker-austin-id';

function fullLoop() {
  let s = createSeedState();
  s = claimTask(s, 'task-litter-oak', W);
  const claim = s.claims.find((c) => c.taskId === 'task-litter-oak' && c.workerId === W)!;
  s = checkInTask(s, claim.id, { lat: 34.045, lng: -118.251 });
  s = submitProof(s, claim.id, { beforePhoto: 'b', afterPhoto: 'a', notes: 'done' });
  return { s, claimId: claim.id };
}

describe('reducers', () => {
  it('claimTask moves task open -> claimed and creates a claim', () => {
    const s = claimTask(createSeedState(), 'task-litter-oak', W);
    expect(s.tasks.find((t) => t.id === 'task-litter-oak')!.status).toBe('claimed');
    expect(s.claims.some((c) => c.taskId === 'task-litter-oak' && c.status === 'claimed')).toBe(true);
  });
  it('checkInTask moves both claim and task to in_progress', () => {
    const { s, claimId } = fullLoop();
    // after submitProof both are submitted; re-run only through checkin:
    let s2 = createSeedState();
    s2 = claimTask(s2, 'task-litter-oak', W);
    const c = s2.claims.find((x) => x.taskId === 'task-litter-oak')!;
    s2 = checkInTask(s2, c.id, { lat: 1, lng: 2 });
    expect(s2.claims.find((x) => x.id === c.id)!.status).toBe('in_progress');
    expect(s2.tasks.find((t) => t.id === 'task-litter-oak')!.status).toBe('in_progress');
  });
  it('submitProof creates submission + pending payment and sets statuses to submitted', () => {
    const { s } = fullLoop();
    const sub = s.submissions.find((x) => x.taskId === 'task-litter-oak')!;
    expect(sub.status).toBe('submitted');
    expect(s.tasks.find((t) => t.id === 'task-litter-oak')!.status).toBe('submitted');
    const pay = s.payments.find((p) => p.submissionId === sub.id)!;
    expect(pay.status).toBe('pending_review');
    expect(pay.amount).toBe(18);
  });
  it('approve makes pending payment available and rolls up impact', () => {
    const { s } = fullLoop();
    const sub = s.submissions.find((x) => x.taskId === 'task-litter-oak')!;
    const before = workerBalances(s, W).available;
    const beforeCompleted = s.campaigns.find((c) => c.id === 'campaign-broadway')!.completedGoal;
    const after = reviewSubmission(s, sub.id, 'approve', { approvedAmount: 18 });
    expect(workerBalances(after, W).available).toBe(before + 18);
    expect(after.tasks.find((t) => t.id === 'task-litter-oak')!.status).toBe('approved');
    expect(after.campaigns.find((c) => c.id === 'campaign-broadway')!.completedGoal).toBe(beforeCompleted + 1);
  });
  it('reject sets submission/task/payment rejected with reason and no balance change', () => {
    const { s } = fullLoop();
    const sub = s.submissions.find((x) => x.taskId === 'task-litter-oak')!;
    const before = workerBalances(s, W).available;
    const after = reviewSubmission(s, sub.id, 'reject', { reason: 'blurry photo' });
    expect(after.submissions.find((x) => x.id === sub.id)!.status).toBe('rejected');
    expect(after.submissions.find((x) => x.id === sub.id)!.reviewReason).toBe('blurry photo');
    expect(after.tasks.find((t) => t.id === 'task-litter-oak')!.status).toBe('rejected');
    expect(after.payments.find((p) => p.submissionId === sub.id)!.status).toBe('rejected');
    expect(workerBalances(after, W).available).toBe(before);
  });
  it('cashOut turns available payments into paid', () => {
    const after = cashOut(createSeedState(), W);
    expect(after.payments.some((p) => p.workerId === W && p.status === 'available')).toBe(false);
  });
  it('reducers do not mutate the input state', () => {
    const s = createSeedState();
    const snapshot = JSON.stringify(s);
    claimTask(s, 'task-litter-oak', W);
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});
```

- [ ] **Step 2: Run, verify it fails**

Run: `npx vitest run src/lib/demo/reducers.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `reducers.ts`**

Write each reducer as a pure function: deep-clone via `structuredClone(state)` at the top, mutate the clone, return it. IDs from a deterministic counter helper `nextId(prefix, n)` (collection length + 1, prefixed). Timestamps are deterministic too: `demoStamp(seq)` offsets `DEMO_EPOCH` by the sequence number so records are stable, not wall-clock.

```ts
import type {
  DemoState, LatLng, Claim, Submission, Payment,
} from './types';
import { DEMO_EPOCH } from './constants';

const demoStamp = (seq: number) => new Date(DEMO_EPOCH + seq * 60000).toISOString();
function nextId(prefix: string, n: number) { return `${prefix}-${n + 1}`; }

export function claimTask(state: DemoState, taskId: string, workerId: string): DemoState {
  const s = structuredClone(state);
  const task = s.tasks.find((t) => t.id === taskId);
  if (!task || task.status !== 'open') return s;
  task.status = 'claimed';
  const claim: Claim = {
    id: nextId('claim', s.claims.length),
    taskId, workerId, status: 'claimed',
    claimedAt: demoStamp(s.claims.length), startedAt: null, completedAt: null, gpsCheckin: null,
  };
  s.claims.push(claim);
  return s;
}

export function checkInTask(state: DemoState, claimId: string, coords: LatLng): DemoState {
  const s = structuredClone(state);
  const claim = s.claims.find((c) => c.id === claimId);
  if (!claim) return s;
  claim.status = 'in_progress';
  claim.startedAt = demoStamp(s.claims.length);
  claim.gpsCheckin = coords;
  const task = s.tasks.find((t) => t.id === claim.taskId);
  if (task) task.status = 'in_progress';
  return s;
}

export function submitProof(
  state: DemoState, claimId: string,
  proof: { beforePhoto: string; afterPhoto: string; notes: string },
): DemoState {
  const s = structuredClone(state);
  const claim = s.claims.find((c) => c.id === claimId);
  if (!claim) return s;
  const task = s.tasks.find((t) => t.id === claim.taskId);
  if (!task) return s;
  claim.status = 'submitted';
  task.status = 'submitted';
  const submission: Submission = {
    id: nextId('sub', s.submissions.length),
    taskId: task.id, workerId: claim.workerId, claimId: claim.id,
    beforePhoto: proof.beforePhoto, afterPhoto: proof.afterPhoto, notes: proof.notes,
    status: 'submitted', submittedAt: demoStamp(s.submissions.length), reviewReason: null,
  };
  s.submissions.push(submission);
  const payment: Payment = {
    id: nextId('pay', s.payments.length),
    workerId: claim.workerId, submissionId: submission.id,
    amount: task.payoutAmount, status: 'pending_review', createdAt: demoStamp(s.payments.length),
  };
  s.payments.push(payment);
  return s;
}

export function reviewSubmission(
  state: DemoState, submissionId: string,
  decision: 'approve' | 'reject',
  opts: { reason?: string; approvedAmount?: number } = {},
): DemoState {
  const s = structuredClone(state);
  const sub = s.submissions.find((x) => x.id === submissionId);
  if (!sub) return s;
  const task = s.tasks.find((t) => t.id === sub.taskId);
  const claim = s.claims.find((c) => c.id === sub.claimId);
  const payment = s.payments.find((p) => p.submissionId === sub.id);

  if (decision === 'reject') {
    sub.status = 'rejected';
    sub.reviewReason = opts.reason ?? 'Did not meet requirements';
    if (task) task.status = 'rejected';
    if (payment) payment.status = 'rejected';
    return s;
  }

  sub.status = 'approved';
  if (claim) { claim.status = 'completed'; claim.completedAt = demoStamp(s.claims.length); }
  if (task) task.status = 'approved';
  if (payment) payment.status = 'available';

  // Impact + campaign rollup
  if (task) {
    const n = s.neighborhoods.find((x) => x.id === task.neighborhoodId);
    if (n) {
      n.tasksCompleted += 1;
      n.paidTotal += payment ? payment.amount : task.payoutAmount;
      // Demo rule: one block is "improved" per 4 completed tasks, so impact
      // does not overstate. Increment only when crossing a multiple of 4.
      if (n.tasksCompleted % 4 === 0) n.blocksImproved += 1;
    }
    if (task.campaignId) {
      const c = s.campaigns.find((x) => x.id === task.campaignId);
      if (c) {
        c.completedGoal += 1;
        c.remainingBudget = Math.max(0, c.remainingBudget - (payment ? payment.amount : task.payoutAmount));
      }
    }
  }
  return s;
}

export function cashOut(state: DemoState, workerId: string): DemoState {
  const s = structuredClone(state);
  s.payments
    .filter((p) => p.workerId === workerId && p.status === 'available')
    .forEach((p) => { p.status = 'paid'; });
  return s;
}

export function createReport(
  state: DemoState,
  payload: { userId: string; category: string; note: string; location: LatLng; photoUrl: string },
): DemoState {
  const s = structuredClone(state);
  s.reports.push({
    id: nextId('report', s.reports.length),
    userId: payload.userId, photoUrl: payload.photoUrl, location: payload.location,
    category: payload.category, note: payload.note, status: 'pending', createdAt: demoStamp(s.reports.length),
  });
  return s;
}

export function createTask(state: DemoState, payload: Partial<DemoState['tasks'][number]> & {
  title: string; description: string; payoutAmount: number; estimatedMinutes: number;
}): DemoState {
  const s = structuredClone(state);
  s.tasks.push({
    id: nextId('task-custom', s.tasks.length),
    title: payload.title, description: payload.description, status: 'open',
    payoutAmount: payload.payoutAmount, estimatedMinutes: payload.estimatedMinutes,
    requiredTools: payload.requiredTools ?? [], safetyNotes: payload.safetyNotes ?? '',
    doList: payload.doList ?? [], dontList: payload.dontList ?? [],
    location: payload.location ?? { lat: 34.0456, lng: -118.2505 },
    taskType: payload.taskType ?? 'cleanup',
    neighborhoodId: payload.neighborhoodId ?? 'downtown',
    campaignId: payload.campaignId ?? null,
    isFundingNeeded: payload.isFundingNeeded ?? false,
    isComingSoon: payload.isComingSoon ?? false,
    reportedByUserId: payload.reportedByUserId ?? null,
  });
  return s;
}

export function promoteReportToTask(
  state: DemoState, reportId: string,
  payload: { title: string; description: string; payoutAmount: number; estimatedMinutes: number },
): DemoState {
  let s = structuredClone(state);
  const report = s.reports.find((r) => r.id === reportId);
  if (!report) return s;
  report.status = 'approved_paid';
  s = createTask(s, {
    ...payload, location: report.location, reportedByUserId: report.userId,
    neighborhoodId: 'downtown',
  });
  return s;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `npx vitest run src/lib/demo/reducers.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/demo/reducers.ts src/lib/demo/reducers.test.ts
git commit -m "feat(demo): pure reducers for the civic task loop with tests"
```

### Task 1.6: Store + hooks

**Files:**
- Create: `src/lib/demo/store.ts`
- Create: `src/lib/demo/hooks.ts`

- [ ] **Step 1: Implement `store.ts`**

```ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DemoState, LatLng, Role } from './types';
import { createSeedState } from './seed';
import { STORE_KEY, STORE_VERSION } from './constants';
import * as R from './reducers';

interface DemoActions {
  claimTask: (taskId: string, workerId: string) => void;
  checkInTask: (claimId: string, coords: LatLng) => void;
  submitProof: (claimId: string, proof: { beforePhoto: string; afterPhoto: string; notes: string }) => void;
  reviewSubmission: (submissionId: string, decision: 'approve' | 'reject', opts?: { reason?: string; approvedAmount?: number }) => void;
  cashOut: (workerId: string) => void;
  createReport: (payload: { userId: string; category: string; note: string; location: LatLng; photoUrl: string }) => void;
  createTask: (payload: Parameters<typeof R.createTask>[1]) => void;
  promoteReportToTask: (reportId: string, payload: Parameters<typeof R.promoteReportToTask>[2]) => void;
  setPersona: (role: Role, userId: string) => void;
  resetDemo: () => void;
}

export type DemoStore = DemoState & DemoActions;

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      ...createSeedState(),
      claimTask: (taskId, workerId) => set((s) => R.claimTask(s, taskId, workerId)),
      checkInTask: (claimId, coords) => set((s) => R.checkInTask(s, claimId, coords)),
      submitProof: (claimId, proof) => set((s) => R.submitProof(s, claimId, proof)),
      reviewSubmission: (id, decision, opts) => set((s) => R.reviewSubmission(s, id, decision, opts)),
      cashOut: (workerId) => set((s) => R.cashOut(s, workerId)),
      createReport: (payload) => set((s) => R.createReport(s, payload)),
      createTask: (payload) => set((s) => R.createTask(s, payload)),
      promoteReportToTask: (reportId, payload) => set((s) => R.promoteReportToTask(s, reportId, payload)),
      setPersona: (role, userId) => set(() => ({ activePersona: { role, userId } })),
      resetDemo: () => set(() => ({ ...createSeedState() })),
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Persist only entity state, never the action functions. Actions always
      // come from the initializer above and are merged back on rehydrate.
      partialize: (state): DemoState => ({
        workers: state.workers, admins: state.admins, sponsors: state.sponsors,
        neighborhoods: state.neighborhoods, campaigns: state.campaigns,
        tasks: state.tasks, claims: state.claims, submissions: state.submissions,
        payments: state.payments, reports: state.reports,
        activePersona: state.activePersona,
      }),
      // Drop persisted state on version bump so seed shape changes never corrupt a demo.
      migrate: () => createSeedState() as Partial<DemoStore>,
    },
  ),
);
```

- [ ] **Step 2: Implement `hooks.ts`** (SSR-safe hydration guard)

```ts
'use client';

import { useEffect, useState } from 'react';

// Returns false during SSR and the first client render, true after mount.
// Use to render seed/loading UI until the persisted store has hydrated,
// preventing hydration mismatches.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit` then `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/demo/store.ts src/lib/demo/hooks.ts
git commit -m "feat(demo): zustand persisted store and hydration hook"
```

### Task 1.7: Toast + Demo controls

**Files:**
- Create: `src/components/demo/Toast.tsx`
- Create: `src/components/demo/DemoControls.tsx`

- [ ] **Step 1: Implement `Toast.tsx`**

A client `ToastProvider` with context exposing `notify(message, tone?)`. Render a fixed bottom-center stack; auto-dismiss after 3500ms. Export `useToast()`. Keep it dependency-free (setTimeout + state). Tones: `success | error | info`, styled with brand tokens.

- [ ] **Step 2: Implement `DemoControls.tsx`**

```tsx
'use client';

import { RotateCcw } from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';

export default function DemoControls() {
  const resetDemo = useDemoStore((s) => s.resetDemo);
  return (
    <button
      type="button"
      onClick={() => { resetDemo(); window.location.reload(); }}
      className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors font-semibold"
      title="Restore the original seeded demo data"
    >
      <RotateCcw size={12} />
      Reset demo
    </button>
  );
}
```

- [ ] **Step 3: Mount ToastProvider in `layout.tsx`**

Wrap `{children}` in `<ToastProvider>`. Build.

- [ ] **Step 4: Commit**

```bash
git add src/components/demo src/app/layout.tsx
git commit -m "feat(demo): toast provider and reset-demo control"
```

---

## Phase 2: Worker Marketplace (functional map)

### Task 2.1: Persona + Reset in the dev bar

**Files:**
- Modify: `src/components/RoleSwitcher.tsx`

- [ ] **Step 1:** Convert persona state to read/write the store via `useDemoStore((s) => s.activePersona)` and `setPersona`. Map persona to default userId: worker→`worker-austin-id`, admin→`admin-id`, sponsor→`sponsor-dtla`. Add a third "Sponsor" button. Remove the cookie writes (store is the source of truth) but keep the hidden-on-`/`-and-`/pitch` behavior. Mount `<DemoControls />` in the bar. Persona switch updates the store and `router.refresh()` is not needed since pages are client; just `setPersona`.
- [ ] **Step 2:** Build, then Playwright: load `/worker/today`, assert dev bar shows three persona buttons and a "Reset demo" control.
- [ ] **Step 3:** Commit.

### Task 2.2: Store-backed functional map

**Files:**
- Modify: `src/app/worker/map/page.tsx`

- [ ] **Step 1:** Replace `fetch('/api/tasks')` + `fallbackTasks` with `useDemoStore((s) => s.tasks)`. Gate render on `useHydrated()` (show the existing loading spinner until hydrated). Adapt the local `Task` interface to import the demo `Task` type (note `location.lat/lng`, `requiredTools` is now `string[]`). Distance strings come from `taskDistanceMiles(task)` instead of hardcoded `0.{index}`.
- [ ] **Step 2:** Pin color by status: `open` brand green, `claimed`/`in_progress` amber, `submitted` blue, `approved` muted/checked, `rejected` red. Keep the `$amount` label for open tasks; show a small status glyph otherwise.
- [ ] **Step 3:** Selection already flows through `selectedTask`; ensure clicking a pin AND a list card both call `onSelectTask` and update the detail panel (already wired — verify with the new data). Filters call `filterTasks` from selectors.
- [ ] **Step 4:** "Claim this task" link points to `/worker/task/${task.id}` (unchanged). The detail panel "Claim" remains a Link. For `isComingSoon` tasks show a "Coming soon" badge and disable claiming; for `isFundingNeeded` tasks show a "Needs funding" badge and disable claiming. These appear via the `coming_soon` / `funding` filters (which intentionally bypass the open-status check) and must be visibly non-claimable so a worker never tries to claim them.
- [ ] **Step 5:** Build. Playwright: load `/worker/map`; assert >= 6 task markers; click the second list card; assert the detail panel heading matches that card's title; click the "Quick" filter; assert marker count drops; assert a distance label matches `/\d+(\.\d+)? mi/`.
- [ ] **Step 6:** Commit.

---

## Phase 3: Worker Loop (claim → check in → proof → submit)

### Task 3.1: Task detail + claim

**Files:**
- Modify: `src/app/worker/task/[id]/page.tsx`, `src/app/worker/task/[id]/claim/page.tsx`

- [ ] **Step 1:** In `[id]/page.tsx`, replace `fetch('/api/tasks')` with `useDemoStore` task lookup by `taskId` (params via `use(params)` as today). Gate on `useHydrated()`. Render do/don't/tools from arrays directly (no string split). The page stays `'use client'`.
- [ ] **Step 2:** In `claim/page.tsx`, on confirm call `useDemoStore.getState().claimTask(taskId, activeWorkerId)` where `activeWorkerId = useDemoStore((s) => s.activePersona.userId)`, then `router.push(\`/worker/task/${taskId}/active\`)`. Replace any `alert` with toast. If the task is not `open`, show inline "Already claimed" state with a link back to the map.
- [ ] **Step 3:** Build. Playwright: from `/worker/map`, open a task, click through claim; assert URL ends `/active`; reload `/worker/map`; assert that task's pin is no longer green/open (status changed persisted).
- [ ] **Step 4:** Commit.

### Task 3.2: Active workspace (check-in, base64 proof, submit)

**Files:**
- Modify: `src/app/worker/task/[id]/active/page.tsx`

- [ ] **Step 1:** Remove all `/api/*` fetches and the inline TODO block. Look up the task and the worker's active claim from the store: `claims.find(c => c.taskId === taskId && c.workerId === activeWorkerId && (c.status === 'claimed' || c.status === 'in_progress'))`. Gate on `useHydrated()`.
- [ ] **Step 2:** Check-in: keep `navigator.geolocation` with the existing mock fallback, but on success call `checkInTask(claim.id, coords)` from the store (no API).
- [ ] **Step 3:** Photo upload: replace the `/api/upload` POST with a local `FileReader.readAsDataURL(file)` that resolves to a base64 data URL stored in component state. If the user does not pick a file, fall back to `PLACEHOLDER_PROOF_IMAGE`.
- [ ] **Step 4:** Submit: call `submitProof(claim.id, { beforePhoto, afterPhoto, notes })`, replace `alert` with toast, then `router.push('/worker/today?submitted=success')`.
- [ ] **Step 5:** Build. Playwright: drive the active page (the geolocation fallback path), upload nothing (use placeholder), submit; then open `/worker/earn` and assert a new "Checking photos" pending row exists; reload and assert it persists.
- [ ] **Step 6:** Commit.

### Task 3.3: Today, Earn, Report

**Files:**
- Modify: `src/app/worker/today/page.tsx`, `worker/earn/page.tsx`, `worker/report/page.tsx`

- [ ] **Step 1:** Convert `today` and `earn` from async server components to `'use client'`. Replace `cookies()` + Prisma with `useDemoStore` selectors: active worker by `activePersona.userId`, `workerBalances`, claims/submissions filtered from the store, campaign via store. Keep all existing markup and the 4-state primary card logic, sourced from store data. Gate on `useHydrated()`.
- [ ] **Step 2:** `worker/earn`: balances via `workerBalances`; payment history mapped from store payments joined to submissions→tasks; `CashoutButton` calls `cashOut(workerId)` from the store (modify `CashoutButton.tsx` to use the store action + toast instead of `/api/payouts/cashout`).
- [ ] **Step 3:** `worker/report`: on submit call `createReport({...})` with the simulated GPS + chosen category + base64 (or placeholder) photo; show inline success (existing success state); no API.
- [ ] **Step 4:** Replace the hardcoded "Today in DTLA" activity feed with a derived list: most recent approved submissions / claims from the store mapped to friendly strings; if empty, keep one seeded fallback line.
- [ ] **Step 5:** Build. Playwright: after the Phase 3.2 submission + an admin approval (use store via UI in Phase 4 spec or seed an approved item), assert `worker/earn` available balance increased. (Defer the cross-persona assertion to the Phase 6 full-loop spec.)
- [ ] **Step 6:** Commit.

---

## Phase 4: Admin Loop

### Task 4.1: Submissions queue + review

**Files:**
- Modify: `src/app/admin/submissions/page.tsx`, `admin/submissions/[id]/page.tsx`

- [ ] **Step 1:** Convert both to `'use client'` reading the store. Queue lists submissions with `status === 'submitted'` joined to task + worker; stats (`pending`, `approved`, paid total) derived from store. Gate on `useHydrated()`.
- [ ] **Step 2:** Detail page: show before/after photos (data URLs or placeholders), notes, task info. Approve button calls `reviewSubmission(id, 'approve', { approvedAmount: task.payoutAmount })` + toast + route back to queue. Reject opens an inline reason field, then `reviewSubmission(id, 'reject', { reason })` + toast.
- [ ] **Step 3:** Build. Playwright: seed a submitted item (via the worker loop earlier in the same spec), open `/admin/submissions`, open it, approve; assert it leaves the queue; switch persona to worker; assert earnings available rose.
- [ ] **Step 4:** Commit.

### Task 4.2: Task create

**Files:**
- Modify: `src/app/admin/tasks/create/page.tsx`

- [ ] **Step 1:** Replace the `POST /api/tasks` submit with `createTask(payload)` from the store (parse number fields, split any comma inputs into arrays). Show toast + route to `/worker/map`. Keep the form UI.
- [ ] **Step 2:** Build. Playwright: create a task; assert it appears as a new marker on `/worker/map`.
- [ ] **Step 3:** Commit.

---

## Phase 5: Outcome Surfaces (sponsor, city, dashboard)

### Task 5.1: Sponsor and city impact

**Files:**
- Modify: `src/app/sponsor/page.tsx`, `src/app/for-cities/page.tsx`

- [ ] **Step 1:** Where these pages show campaign/impact numbers, source them from the store: `campaignProgress`, campaign `completedGoal`/`remainingBudget`, neighborhood `tasksCompleted`/`paidTotal`/`blocksImproved`, and recent approved submissions' proof thumbnails. Use "demo budget" / "funding pool" language; label simulated payout totals as demo. If a page is currently fully static marketing, add one store-backed "Live demo impact" panel rather than rewriting the marketing copy.
- [ ] **Step 2:** Build. Playwright: assert the sponsor page shows the campaign percent that matches `campaignProgress` for `campaign-broadway` from a freshly reset store (42%).
- [ ] **Step 3:** Commit.

### Task 5.2: Dashboard command center

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1:** If the dashboard uses hardcoded neighborhood/task/payment numbers, repoint the key tiles to store selectors (`neighborhoodImpact`, counts of tasks by status, pending payments total). Preserve the gamified visual. Gate on `useHydrated()` if it becomes a client component.
- [ ] **Step 2:** Build. Playwright: dashboard renders without console errors and shows at least the seeded neighborhoods.
- [ ] **Step 3:** Commit.

---

## Phase 6: Public Polish + Full-Loop Verification

### Task 6.1: Public route + nav audit

**Files:**
- Modify: as needed across `/`, `/earn`, `/for-cities`, `/sponsor`, `/how-it-works`, `/dtla-pilot`, shared `Header`/`Footer`.

- [ ] **Step 1:** Verify every nav link and primary CTA resolves to a real page. Confirm `Find tasks near me`→`/worker/map`, `Sponsor a block`→`/sponsor`, `How it works` on the pitch homepage stays wired to the interactive walkthrough, and the Welcome intro on `/` is intact (`welcome → story → home`). Replace any dead button with a working link, a clear demo modal, or remove it. Internal nav uses `next/link`; control icons use `lucide-react`. No em dashes in copy you add.
- [ ] **Step 2:** Build. Playwright: visit each public route, assert 200 + no console errors + the expected primary CTA href.
- [ ] **Step 3:** Commit.

### Task 6.2: Responsive + overlay pass

- [ ] **Step 1:** Playwright at desktop (1280x800) and mobile (390x844) for `/`, `/worker/map` (both desktop and mobile map toggle), `/worker/today`, `/admin/submissions`, `/sponsor`. Screenshot each; check for clipped text, overlap, broken controls, console errors, and Next dev error overlays.
- [ ] **Step 2:** Fix any clipping/overlap found in the touched components. Build.
- [ ] **Step 3:** Commit.

### Task 6.3: Full-loop Playwright spec

**Files:**
- Create: `tests/e2e/demo-loop.spec.ts`

- [ ] **Step 1:** Write a Playwright spec covering, in one browser context (shared localStorage). Select by stable accessible labels (`getByRole('button', { name: 'Begin' })`, `'Continue'`, `'Enter CivicTree Demo'`, `'Find tasks near me'`, persona buttons, `'Reset demo'`) rather than brittle visual text, so copy tweaks do not break the test:
  1. Home `/`: Welcome intro renders ("Begin" present); click Begin, step through the walkthrough (Continue x N), click "Enter CivicTree Demo" to reach product home, then click `Find tasks near me` → lands on `/worker/map`.
  2. Map: a filter changes the visible marker count; selecting a pin updates the detail title.
  3. Worker claims a task → reaches `/active`.
  4. Worker checks in (geolocation fallback), submits proof with placeholder image → `/worker/today`.
  5. Switch persona to Admin (dev bar); `/admin/submissions` shows the new item; approve it.
  6. Switch persona to Worker; `/worker/earn` available balance increased vs. the seeded baseline.
  7. Sponsor/city impact (`/sponsor`) shows incremented completed count.
  8. Click "Reset demo"; reload; assert `/worker/map` open-task count and `/worker/earn` balance match the seeded baseline.
- [ ] **Step 2:** Run the spec headless against `npm run dev`. Iterate until green.
- [ ] **Step 3:** Commit.

---

## Phase 7: Documentation + Handoff

### Task 7.1: README

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** Replace boilerplate with: project summary; setup (`npm install`, `npm run dev`); the fact that no DB/env/external services are required for the demo; demo personas (Austin / Maya / Jordan / Admin / Sponsor) and how to switch via the dev bar; Reset demo; route list with what each demonstrates; how state persists (localStorage, versioned) and resets; known demo-only limitations; and a "Production path" section (Postgres + Prisma, object storage for proof, Twilio OTP, Stripe Connect payouts, real map tiles) referencing the dormant `prisma/` and `/api/*` code.
- [ ] **Step 2:** Commit.

### Task 7.2: Punch list

**Files:**
- Create: `docs/superpowers/DEMO-PUNCHLIST.md`

- [ ] **Step 1:** List everything intentionally left demo-only: object-URL-free base64 proof, mock geolocation fallback, no real auth/session, no SMS, no payments, CSS map (no Mapbox), dormant Prisma/API. For each, one line on the production replacement.
- [ ] **Step 2:** Commit.

---

## Self-Review Notes

- **Spec coverage:** store/seed/reset (Ph1), functional map + selection/filters/distance/status (Ph2), claim→checkin→proof→submit with base64 + no alerts (Ph3), admin approve/reject + impact rollup + task create (Ph4), sponsor/city/dashboard outcome surfaces (Ph5), public CTAs + Welcome intro preserved + responsive + full-loop (Ph6), docs + punch list (Ph7). All acceptance criteria map to the Phase 6.3 spec.
- **Status model:** check-in sets claim AND task `in_progress` (reducers + Task 3.2). Reject sets submission/task/payment `rejected`, claim stays `submitted` (reducers + Task 4.1). Names consistent: `claimTask`, `checkInTask`, `submitProof`, `reviewSubmission`, `cashOut`, `createReport`, `createTask`, `promoteReportToTask`, `setPersona`, `resetDemo` across reducers, store, and call sites.
- **Persistence:** localStorage via persist; `resetDemo` reseeds; `migrate` drops stale state on version bump.
- **Proof persistence:** base64 data URLs (Task 3.2) so thumbnails survive refresh, matching the spec.
