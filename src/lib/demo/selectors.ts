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
    if (filter === 'highest_pay') return t.payoutAmount >= 40;
    if (filter === 'no_tools') return t.requiredTools.length === 0 || t.requiredTools.join().toLowerCase().includes('none');
    if (filter === 'verify') return t.taskType === 'verify';
    return true; // 'all'
  });
}

export function neighborhoodImpact(state: DemoState) {
  return state.neighborhoods.map((n) => ({ ...n }));
}
