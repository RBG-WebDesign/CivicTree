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
