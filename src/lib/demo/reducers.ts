import type {
  DemoState, LatLng, Claim, Submission, Payment,
} from './types';
import {
  ALLEY_AFTER_IMAGE,
  ALLEY_BEFORE_IMAGE,
  DEMO_EPOCH,
  PLACEHOLDER_TASK_IMAGE,
} from './constants';

const demoStamp = (seq: number) => new Date(DEMO_EPOCH + seq * 60000).toISOString();
function nextId(prefix: string, n: number) { return `${prefix}-${n + 1}`; }

const LIVE_TASK_TITLES = [
  'Trash building up near transit stop',
  'Sticker cleanup on utility poles',
  'Overflow litter near park entrance',
  'Planter needs watering and sweep',
  'Broken glass reported by storefront',
  'Alley cleanup behind restaurant row',
];

const LIVE_REPORTS = [
  { category: 'litter', note: 'Resident reported loose trash spreading into the crosswalk.' },
  { category: 'graffiti', note: 'Storefront tag needs a quick verification before dispatch.' },
  { category: 'planter', note: 'Sponsor planter looks dry and needs a maintenance check.' },
  { category: 'safety', note: 'Broken glass reported near a bus stop.' },
];

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

export function simulateOpsEvent(state: DemoState): DemoState {
  const s = cloneDemoState(state);
  const seq = s.reports.length + s.tasks.length + s.submissions.length;
  const neighborhood = s.neighborhoods[seq % s.neighborhoods.length];
  const worker = s.workers.filter((item) => item.role === 'worker')[seq % Math.max(1, s.workers.length)];

  if (seq % 3 === 0) {
    const report = LIVE_REPORTS[seq % LIVE_REPORTS.length];
    s.reports.push({
      id: nextId('report-live', s.reports.length),
      userId: 'resident-live-demo',
      photoUrl: PLACEHOLDER_TASK_IMAGE,
      location: { lat: 34.0456 + (seq % 7) * 0.001, lng: -118.2505 - (seq % 5) * 0.001 },
      category: report.category,
      note: report.note,
      status: 'pending',
      createdAt: demoStamp(s.reports.length),
    });
    if (neighborhood) neighborhood.openReports += 1;
    return s;
  }

  if (seq % 3 === 1) {
    const title = LIVE_TASK_TITLES[seq % LIVE_TASK_TITLES.length];
    s.tasks.push({
      id: nextId('task-live', s.tasks.length),
      title,
      description: 'Live demo task generated from incoming resident and sponsor activity.',
      status: 'open',
      payoutAmount: 14 + (seq % 5) * 4,
      estimatedMinutes: 12 + (seq % 4) * 8,
      requiredTools: ['gloves', 'trash bag'],
      safetyNotes: 'Stay visible, avoid traffic, and do not handle hazardous material.',
      doList: ['Photograph the full site before starting', 'Clear visible loose debris', 'Sweep the immediate area', 'Capture the same-angle after photo'],
      dontList: ['Do not enter private property', 'Do not handle needles or chemicals'],
      location: { lat: 34.0456 + (seq % 6) * 0.001, lng: -118.2505 - (seq % 6) * 0.001 },
      taskType: 'cleanup',
      neighborhoodId: neighborhood?.id ?? 'downtown',
      campaignId: seq % 2 === 0 ? 'campaign-broadway' : null,
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    });
    return s;
  }

  const title = LIVE_TASK_TITLES[seq % LIVE_TASK_TITLES.length];
  const taskId = nextId('task-live', s.tasks.length);
  const workerId = worker?.id ?? 'worker-austin-id';
  const claimId = nextId('claim-live', s.claims.length);
  const submissionId = nextId('sub-live', s.submissions.length);
  const payoutAmount = 18 + (seq % 4) * 5;
  s.tasks.push({
    id: taskId,
    title,
    description: 'Worker completed this live demo job and sent proof to admin review.',
    status: 'submitted',
    payoutAmount,
    estimatedMinutes: 15 + (seq % 4) * 5,
    requiredTools: ['gloves', 'trash bag'],
    safetyNotes: 'Stay visible and avoid traffic.',
    doList: ['Before photo captured', 'Cleanup completed', 'After photo captured'],
    dontList: ['Do not enter private property'],
    location: { lat: 34.0456 + (seq % 6) * 0.001, lng: -118.2505 - (seq % 6) * 0.001 },
    taskType: 'cleanup',
    neighborhoodId: neighborhood?.id ?? 'downtown',
    campaignId: seq % 2 === 0 ? 'campaign-broadway' : null,
    isFundingNeeded: false,
    isComingSoon: false,
    reportedByUserId: null,
  });
  s.claims.push({
    id: claimId,
    taskId,
    workerId,
    status: 'submitted',
    claimedAt: demoStamp(s.claims.length),
    startedAt: demoStamp(s.claims.length + 1),
    completedAt: null,
    gpsCheckin: { lat: 34.0456 + (seq % 6) * 0.001, lng: -118.2505 - (seq % 6) * 0.001 },
  });
  s.submissions.push({
    id: submissionId,
    taskId,
    workerId,
    claimId,
    beforePhoto: ALLEY_BEFORE_IMAGE,
    afterPhoto: ALLEY_AFTER_IMAGE,
    notes: 'Live sim: before photo, checklist, GPS, and after photo captured.',
    status: 'submitted',
    submittedAt: demoStamp(s.submissions.length),
    reviewReason: null,
  });
  s.payments.push({
    id: nextId('pay-live', s.payments.length),
    workerId,
    submissionId,
    amount: payoutAmount,
    status: 'pending_review',
    createdAt: demoStamp(s.payments.length),
  });
  return s;
}
