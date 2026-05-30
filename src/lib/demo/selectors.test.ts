import { describe, it, expect } from 'vitest';
import { createSeedState } from './seed';
import {
  workerBalances, campaignProgress, haversineMiles, taskDistanceMiles, filterTasks,
} from './selectors';
import { DEMO_USER_LOCATION } from './constants';

describe('selectors', () => {
  it('computes Austin balances from seed', () => {
    const b = workerBalances(createSeedState(), 'worker-austin-id');
    expect(b.available).toBe(32); // available to cash out (excludes already paid)
    expect(b.paid).toBe(20);
    expect(b.pending).toBe(28);
    expect(b.lifetime).toBe(80); // available + paid + pending
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
  it('filterTasks "highest_pay" keeps substantial payouts', () => {
    const highPay = filterTasks(createSeedState().tasks, 'highest_pay');
    expect(highPay.length).toBeGreaterThan(0);
    expect(highPay.every((t) => t.status === 'open' && t.payoutAmount >= 40)).toBe(true);
  });
});
