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
