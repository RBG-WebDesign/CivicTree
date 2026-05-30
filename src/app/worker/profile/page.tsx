// src/app/worker/profile/page.tsx
'use client';

import Link from 'next/link';
import WorkerNav from '@/components/WorkerNav';
import {
  Award, ShieldCheck, Landmark, Globe, HelpCircle, AlertTriangle,
  CheckCircle2, Clock, Monitor,
} from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { useHydrated } from '@/lib/demo/hooks';
import { workerBalances } from '@/lib/demo/selectors';

export default function WorkerProfile() {
  const hydrated = useHydrated();
  const workerId = useDemoStore((s) => s.activePersona.userId);
  const workers = useDemoStore((s) => s.workers);
  const submissions = useDemoStore((s) => s.submissions);
  const claims = useDemoStore((s) => s.claims);
  const state = useDemoStore();

  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-24">
        <div className="bg-white border-b border-border py-4 px-6 sticky top-[38px] z-10">
          <div className="h-5 w-28 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
          <div className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
        </div>
        <WorkerNav />
      </div>
    );
  }

  const worker = workers.find((item) => item.id === workerId) ?? workers[0];
  const balances = workerBalances(state, worker?.id ?? workerId);
  const workerSubmissions = submissions.filter((item) => item.workerId === worker?.id);
  const pendingCount = workerSubmissions.filter((item) => item.status === 'submitted').length;
  const approvedCount = workerSubmissions.filter((item) => item.status === 'approved').length;
  const activeCount = claims.filter(
    (item) => item.workerId === worker?.id && (item.status === 'claimed' || item.status === 'in_progress'),
  ).length;

  const levelNames = ['Seed', 'Sprout', 'Branch', 'Grove', 'Steward', 'City Steward'];
  const levelNum = worker?.level || 1;
  const levelName = levelNames[Math.min(levelNum - 1, levelNames.length - 1)];
  const progress = Math.min(92, Math.max(25, levelNum * 18 + approvedCount * 4));
  const initial = worker?.name?.slice(0, 1) || 'A';

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-24">
      <div className="bg-white border-b border-border py-4 px-6 sticky top-[38px] z-10 flex items-center justify-between">
        <h1 className="text-sm font-bold tracking-tight text-foreground font-heading">Your Profile</h1>
        <Link href="/worker/desktop" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-primary border border-emerald-100">
          <Monitor size={12} />
          Desktop
        </Link>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4 bg-[#faf9f5] border border-border p-5 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-xl font-heading shadow-md">
            {initial}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="text-base font-extrabold text-foreground font-heading truncate">{worker?.name || 'Austin'}</h2>
            <p className="text-xs text-muted">Neighborhood: {worker?.neighborhoodId || 'downtown'}</p>
            <p className="text-[10px] text-muted-foreground">Worker ID: {worker?.id || 'worker-austin-id'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="border border-border p-3 rounded-2xl flex flex-col gap-1 text-center">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Available</span>
            <span className="text-base font-black text-[#2d6a4f] font-heading">${balances.available.toFixed(0)}</span>
          </div>
          <div className="border border-border p-3 rounded-2xl flex flex-col gap-1 text-center">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Pending</span>
            <span className="text-base font-black text-amber-700 font-heading">${balances.pending.toFixed(0)}</span>
          </div>
          <div className="border border-border p-3 rounded-2xl flex flex-col gap-1 text-center">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Approved</span>
            <span className="text-base font-black text-[#2d6a4f] font-heading">{approvedCount}</span>
          </div>
        </div>

        <div className="border border-border p-5 rounded-3xl flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-primary" />
              <span className="text-xs font-bold text-foreground">Trust level: {levelName}</span>
            </div>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-100/60">
              Level {levelNum}
            </span>
          </div>

          <p className="text-xs text-[#555] leading-relaxed">
            {worker?.onboardingCompleted
              ? 'You have unlocked cleanup, verification, and longer route work.'
              : 'Complete basic training to unlock more paid task types.'}
          </p>

          <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Safety Score</span>
            <span className="text-lg font-black text-[#2d6a4f] font-heading">{worker?.safetyScore.toFixed(0) ?? 98}%</span>
            <span className="text-[9px] text-[#555]">Zero safety incidents</span>
          </div>
          <div className="border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Reliability</span>
            <span className="text-lg font-black text-[#2d6a4f] font-heading">{worker?.reliabilityScore.toFixed(0) ?? 98}%</span>
            <span className="text-[9px] text-[#555]">High task success rate</span>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
          <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-black text-foreground font-heading">Verification status</h3>
            <p className="text-[11px] text-muted mt-1 leading-relaxed">
              {pendingCount > 0
                ? `${pendingCount} submitted task${pendingCount === 1 ? '' : 's'} waiting for admin approval.`
                : activeCount > 0
                  ? `${activeCount} active task${activeCount === 1 ? '' : 's'} in progress.`
                  : 'No active review blockers. New submissions will appear in Admin Review.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading mb-1">
            Portal Settings
          </h3>

          <Link
            href="/worker/training"
            className="flex items-center justify-between p-4 rounded-2xl border border-border bg-white hover:bg-neutral-50 transition-all text-xs font-bold text-foreground"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-primary" />
              <span>Safety & Skill Lessons</span>
            </div>
            <span className="text-[10px] text-muted font-medium">Unlocks more tasks</span>
          </Link>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-white text-xs font-bold text-foreground">
            <div className="flex items-center gap-3">
              <Landmark size={16} className="text-primary" />
              <span>Payout Method Setup</span>
            </div>
            <span className="text-[10px] text-[#2d6a4f] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Verified</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-white text-xs font-bold text-foreground">
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-primary" />
              <span>Preferred Language</span>
            </div>
            <span className="text-[10px] text-muted uppercase tracking-wider font-bold">English</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#eae8e2]/60 pt-4 mt-2">
          <Link
            href="/support"
            className="flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-all"
          >
            <HelpCircle size={14} />
            Need help or support?
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            <AlertTriangle size={14} />
            Account status: <span className="text-[#2d6a4f] font-black">Active</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-muted">
            <Clock size={14} />
            Review timing: <span className="text-[#2d6a4f] font-black">Usually under 1 hour</span>
          </div>
        </div>
      </div>

      <WorkerNav />
    </div>
  );
}
