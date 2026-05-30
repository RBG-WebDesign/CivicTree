// src/app/worker/today/page.tsx
'use client';

import Link from 'next/link';
import WorkerNav from '@/components/WorkerNav';
import { MapPin, Award, AlertCircle, ArrowRight, ShieldCheck, HelpCircle, Activity, Flame, TrendingUp, Monitor } from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { workerBalances, campaignProgress } from '@/lib/demo/selectors';
import { useHydrated } from '@/lib/demo/hooks';

export default function WorkerToday() {
  const hydrated = useHydrated();

  const workerId = useDemoStore((s) => s.activePersona.userId);
  const workers = useDemoStore((s) => s.workers);
  const tasks = useDemoStore((s) => s.tasks);
  const claims = useDemoStore((s) => s.claims);
  const submissions = useDemoStore((s) => s.submissions);
  const campaigns = useDemoStore((s) => s.campaigns);
  const reports = useDemoStore((s) => s.reports);
  const state = useDemoStore();

  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-24">
        <div className="bg-primary text-white p-6 rounded-b-[2rem] shadow-md flex flex-col gap-4">
          <div className="h-6 w-48 bg-emerald-800/50 rounded animate-pulse" />
        </div>
        <WorkerNav />
      </div>
    );
  }

  const worker = workers.find((w) => w.id === workerId);
  const { available: availableBalance, pending: pendingBalance } = workerBalances(state, workerId);

  // Active claims for this worker
  const activeClaims = claims.filter(
    (c) => c.workerId === workerId && (c.status === 'claimed' || c.status === 'in_progress'),
  );

  // Submissions for this worker
  const workerSubmissions = submissions
    .filter((s) => s.workerId === workerId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const hasPendingReview = workerSubmissions.some((s) => s.status === 'submitted');

  // Open paid tasks (no funding-needed / coming-soon)
  const allPaidTasks = tasks
    .filter((t) => t.status === 'open' && !t.isComingSoon && !t.isFundingNeeded)
    .sort((a, b) => b.payoutAmount - a.payoutAmount);

  // Jordan rule
  const paidTasks = workerId === 'worker-notasks-id' ? [] : allPaidTasks;
  const topPayout = paidTasks.length > 0 ? paidTasks[0].payoutAmount : 0;
  const availableToday = paidTasks.reduce((sum, task) => sum + task.payoutAmount, 0);
  const targetTasks = paidTasks.slice(0, 4);
  const targetValue = targetTasks.reduce((sum, task) => sum + task.payoutAmount, 0);
  const targetMinutes = targetTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);

  const pendingReportCount = reports.filter((r) => r.status === 'pending').length;
  const upcomingCareCount = tasks.filter(
    (t) => t.status === 'open' && (t.isComingSoon || t.isFundingNeeded),
  ).length;
  const careCount = paidTasks.length + pendingReportCount + upcomingCareCount;

  const campaign = campaigns.find((c) => c.id === 'campaign-broadway');
  const campPct = campaign ? campaignProgress(state, 'campaign-broadway') : 0;

  // Determine User State & Primary Card Details
  let primaryCard = {
    title: `Earn up to $${targetValue.toFixed(0)} nearby`,
    desc: `${paidTasks.length} paid task${paidTasks.length === 1 ? '' : 's'} within 1 mile. A focused ${Math.max(1, Math.round(targetMinutes / 60))}-hour route can pay real money.`,
    buttonText: 'View paid tasks',
    link: '/worker/map',
    style: 'bg-[#1b4332] text-white border-[#1b4332]',
    buttonStyle: 'bg-white text-primary hover:bg-neutral-100',
  };

  // State 1: New user, onboarding not completed
  if (worker && !worker.onboardingCompleted) {
    primaryCard = {
      title: 'Unlock paid tasks',
      desc: 'Finish the 3-minute safety intro to get started.',
      buttonText: 'Start onboarding',
      link: '/worker/onboarding',
      style: 'bg-amber-600 text-white border-amber-600',
      buttonStyle: 'bg-white text-amber-800 hover:bg-amber-50',
    };
  }
  // State 2: Trained, but no tasks nearby (e.g. Jordan in Arts District)
  else if (workerId === 'worker-notasks-id') {
    primaryCard = {
      title: 'No paid tasks right here yet',
      desc: 'Help create them. Report something dirty, broken, or unsafe.',
      buttonText: 'Report something',
      link: '/worker/report',
      style: 'bg-slate-700 text-white border-slate-700',
      buttonStyle: 'bg-white text-slate-800 hover:bg-slate-50',
    };
  }
  // State 3: User has active claimed task in progress
  else if (activeClaims.length > 0) {
    const activeTask = tasks.find((t) => t.id === activeClaims[0].taskId);
    if (activeTask) {
      primaryCard = {
        title: 'Finish your task',
        desc: `You still need an after photo for: ${activeTask.title}`,
        buttonText: 'Finish submission',
        link: `/worker/task/${activeTask.id}/active`,
        style: 'bg-emerald-700 text-white border-emerald-700',
        buttonStyle: 'bg-white text-emerald-800 hover:bg-emerald-50',
      };
    }
  }
  // State 4: User has pending reviews (payment checking)
  else if (hasPendingReview) {
    primaryCard = {
      title: 'Your work is being checked',
      desc: `$${pendingBalance.toFixed(2)} pending review. Most reviews take under an hour.`,
      buttonText: 'View earnings',
      link: '/worker/earn',
      style: 'bg-primary text-white border-primary',
      buttonStyle: 'bg-emerald-800 text-white hover:bg-emerald-950',
    };
  }

  // Level names mapping
  const levelNames = ['Seed', 'Sprout', 'Branch', 'Grove', 'Steward', 'City Steward'];
  const userLevel = worker?.level || 1;
  const levelName = levelNames[Math.min(userLevel - 1, levelNames.length - 1)];

  // Derived activity feed: most recent approved submissions across all workers
  const recentApproved = submissions
    .filter((s) => s.status === 'approved')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 4);

  const activityFeed: string[] =
    recentApproved.length > 0
      ? recentApproved.map((s) => {
          const t = tasks.find((t) => t.id === s.taskId);
          if (!t) return 'A task was approved and paid.';
          return `${t.title} was approved and paid $${t.payoutAmount.toFixed(0)}.`;
        })
      : ['Someone cleaned litter near Oak St.'];

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-24">
      {/* Upper Status Banner */}
      <div className="bg-primary text-white p-6 rounded-b-[2rem] shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold font-heading">Good morning, {worker?.name || 'Austin'}.</h1>
            <p className="text-sm font-semibold text-emerald-100 mt-1">{careCount} things need care near you.</p>
            <p className="text-[10px] text-emerald-300/80 mt-0.5">Downtown Los Angeles Pilot</p>
            <Link href="/worker/desktop" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/45 px-3 py-1.5 text-[10px] font-black text-emerald-100 border border-emerald-700/40">
              <Monitor size={12} />
              Open desktop planner
            </Link>
          </div>
          <div className="bg-emerald-800/50 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] flex items-center gap-1 font-bold text-emerald-100">
            <Award size={10} className="text-emerald-300" />
            Level {userLevel}: {levelName}
          </div>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4 bg-emerald-950/40 border border-emerald-800/40 p-4 rounded-2xl">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-300">Available</span>
            <div className="text-xl font-black font-heading mt-0.5">${availableBalance.toFixed(2)}</div>
          </div>
          <div className="border-l border-emerald-800/40 pl-4">
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-300">Pending Review</span>
            <div className="text-xl font-black font-heading mt-0.5 text-emerald-100">${pendingBalance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex flex-col gap-6 flex-1">
        {/* Dynamic Primary Action Card */}
        <div className={`${primaryCard.style} border p-5 rounded-3xl shadow-md flex flex-col gap-4 relative overflow-hidden`}>
          <div className="flex flex-col gap-1 pr-12">
            <span className="text-[9px] uppercase font-black tracking-widest opacity-80">Next Step</span>
            <h2 className="text-lg font-black tracking-tight font-heading leading-snug">
              {primaryCard.title}
            </h2>
            <p className="text-xs opacity-90 leading-relaxed mt-0.5">
              {primaryCard.desc}
            </p>
          </div>
          <Link
            href={primaryCard.link}
            className={`${primaryCard.buttonStyle} text-xs font-bold py-3 px-4 rounded-xl shadow-sm self-start transition-all`}
          >
            {primaryCard.buttonText}
          </Link>
        </div>

        {/* Action cards */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading flex items-center gap-1">
            <Flame size={12} className="text-[#2d6a4f]" />
            Today near you
          </h3>

          {/* Paid tasks near you with empty-state alternative */}
          {paidTasks.length > 0 ? (
            <Link
              href="/worker/map"
              className="bg-[#faf9f5] border border-border rounded-2xl p-4 flex items-center gap-3.5 hover:border-[#2d6a4f]/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-[#1b4332]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground font-heading">Paid tasks near you</div>
                <p className="text-[11px] text-[#555] mt-0.5">
                  {paidTasks.length} paid task{paidTasks.length === 1 ? '' : 's'} nearby. ${availableToday.toFixed(0)} available today. Top payout ${topPayout.toFixed(0)}.
                </p>
              </div>
              <ArrowRight size={16} className="text-muted group-hover:text-[#1b4332] shrink-0" />
            </Link>
          ) : (
            <div className="bg-[#faf9f5] border border-border rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground font-heading">Paid tasks near you</div>
                  <p className="text-[11px] text-[#555] mt-0.5 leading-relaxed">
                    No paid tasks nearby right now. You can still help get this area ready.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/worker/report" className="flex-1 text-center bg-[#1b4332] text-white text-[11px] font-bold py-2.5 rounded-xl hover:bg-emerald-950 transition-colors">
                  Report something
                </Link>
                <Link href="/worker/map" className="flex-1 text-center bg-white border border-border text-foreground text-[11px] font-bold py-2.5 rounded-xl hover:border-[#2d6a4f]/40 transition-colors">
                  Verify a report
                </Link>
              </div>
            </div>
          )}

          {/* Report something */}
          <Link
            href="/worker/report"
            className="bg-[#faf9f5] border border-border rounded-2xl p-4 flex items-center gap-3.5 hover:border-[#2d6a4f]/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground font-heading">Report something</div>
              <p className="text-[11px] text-[#555] mt-0.5">Report something dirty, broken, or unsafe.</p>
            </div>
            <span className="text-[11px] font-bold text-[#2d6a4f] shrink-0">Up to $12</span>
          </Link>

          {/* Verify a nearby report */}
          <Link
            href="/worker/map"
            className="bg-[#faf9f5] border border-border rounded-2xl p-4 flex items-center gap-3.5 hover:border-[#2d6a4f]/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <HelpCircle size={18} className="text-sky-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground font-heading">Verify a nearby report</div>
              <p className="text-[11px] text-[#555] mt-0.5">
                {pendingReportCount > 0
                  ? `${pendingReportCount} report${pendingReportCount === 1 ? '' : 's'} need a quick check.`
                  : 'Check if a reported issue still exists.'}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#2d6a4f] shrink-0">$10 to $12</span>
          </Link>

          {/* Nearby campaign progress */}
          {campaign && (
            <Link
              href="/worker/map"
              className="bg-[#faf9f5] border border-border rounded-2xl p-4 flex items-center gap-3.5 hover:border-[#2d6a4f]/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-[#1b4332]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground font-heading">{campaign.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2d6a4f] h-full rounded-full"
                      style={{ width: `${campPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-[#1b4332] shrink-0">
                    {campPct}%
                  </span>
                </div>
                <p className="text-[11px] text-[#555] mt-0.5">
                  {campaign.targetGoal - campaign.completedGoal} tasks left to complete this block.
                </p>
              </div>
              <ArrowRight size={16} className="text-muted group-hover:text-[#1b4332] shrink-0" />
            </Link>
          )}

          {/* Finish safety training, prominent if incomplete, confirmation if done */}
          {worker && !worker.onboardingCompleted ? (
            <Link
              href="/worker/training"
              className="bg-[#faf9f5] border border-border rounded-2xl p-4 flex items-center gap-3.5 hover:border-[#2d6a4f]/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} className="text-[#1b4332]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground font-heading">Finish safety training</div>
                <p className="text-[11px] text-[#555] mt-0.5">Finish Safety Basics to unlock more tasks.</p>
              </div>
              <span className="text-[11px] font-bold text-primary shrink-0">Unlock</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 px-1 text-[11px] font-semibold text-[#2d6a4f]">
              <ShieldCheck size={14} />
              Safety Basics complete. You&apos;re cleared for nearby tasks.
            </div>
          )}
        </div>

        {/* Campaign progress */}
        {campaign && (
          <div className="border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-bold text-muted tracking-wider">Active Campaign</span>
                <h4 className="text-sm font-bold text-foreground font-heading mt-0.5">{campaign.title}</h4>
              </div>
              <span className="text-xs font-black text-primary font-heading">
                {campPct}%
              </span>
            </div>

            <p className="text-[11px] text-[#555] leading-relaxed">
              {campaign.description} Goal: {campaign.targetGoal} tasks. Currently: {campaign.completedGoal} done.
            </p>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${campPct}%` }}
              />
            </div>

            <Link
              href="/worker/map"
              className="text-[10px] font-bold text-[#1b4332] flex items-center gap-0.5 hover:underline mt-1"
            >
              Help this campaign
              <ArrowRight size={10} />
            </Link>
          </div>
        )}

        {/* Neighborhood Activity Feed */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading flex items-center gap-1.5">
            <Activity size={12} className="text-[#2d6a4f]" />
            Today in DTLA
          </h3>

          <div className="bg-[#faf9f5] border border-border p-4 rounded-3xl flex justify-between gap-4 text-center text-xs mb-1">
            <div>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Completed</span>
              <div className="text-base font-black text-foreground font-heading mt-0.5">8 tasks</div>
            </div>
            <div className="border-l border-border/60" />
            <div>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Paid Out</span>
              <div className="text-base font-black text-foreground font-heading mt-0.5">$214</div>
            </div>
            <div className="border-l border-border/60" />
            <div>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Improved</span>
              <div className="text-base font-black text-foreground font-heading mt-0.5">3 blocks</div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {activityFeed.map((line, i) => (
              <div key={i} className="text-[11px] text-[#555] leading-relaxed flex gap-2 items-start border-l-2 border-emerald-500 pl-3">
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WorkerNav />
    </div>
  );
}
