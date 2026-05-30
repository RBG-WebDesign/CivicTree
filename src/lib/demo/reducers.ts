import type {
  DemoState, LatLng, Claim, Submission, Payment,
} from './types';
import { DEMO_EPOCH } from './constants';

const demoStamp = (seq: number) => new Date(DEMO_EPOCH + seq * 60000).toISOString();
function nextId(prefix: string, n: number) { return `${prefix}-${n + 1}`; }

function cloneDemoState(state: DemoState): DemoState {
  return structuredClone({
    workers: state.workers,
    admins: state.admins,
    sponsors: state.sponsors,
    neighborhoods: state.neighborhoods,
    campaigns: state.campaigns,
    tasks: state.tasks,
    claims: state.claims,
    submissions: state.submissions,
    payments: state.payments,
    reports: state.reports,
    activePersona: state.activePersona,
  });
}

export function claimTask(state: DemoState, taskId: string, workerId: string): DemoState {
  const s = cloneDemoState(state);
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
  const s = cloneDemoState(state);
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
  const s = cloneDemoState(state);
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
  const s = cloneDemoState(state);
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
  const s = cloneDemoState(state);
  s.payments
    .filter((p) => p.workerId === workerId && p.status === 'available')
    .forEach((p) => { p.status = 'paid'; });
  return s;
}

export function createReport(
  state: DemoState,
  payload: { userId: string; category: string; note: string; location: LatLng; photoUrl: string },
): DemoState {
  const s = cloneDemoState(state);
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
  const s = cloneDemoState(state);
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
  let s = cloneDemoState(state);
  const report = s.reports.find((r) => r.id === reportId);
  if (!report) return s;
  report.status = 'approved_paid';
  s = createTask(s, {
    ...payload, location: report.location, reportedByUserId: report.userId,
    neighborhoodId: 'downtown',
  });
  return s;
}
