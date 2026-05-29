// src/app/worker/today/page.tsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import WorkerNav from '@/components/WorkerNav';
import { MapPin, DollarSign, Award, AlertCircle, ArrowRight, ShieldCheck, HelpCircle, Activity, Sparkles, Flame } from 'lucide-react';

export const revalidate = 0; // Disable caching

export default async function WorkerToday() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('civictree_user_id')?.value || 'worker-austin-id';

  // Fetch worker stats
  const worker = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      claims: {
        where: { status: { in: ['claimed', 'in_progress'] } },
        include: { task: true },
      },
      submissions: {
        orderBy: { submittedAt: 'desc' },
        include: { task: true },
      },
    },
  });

  // Calculate balances
  const payments = await prisma.payment.findMany({
    where: { workerId: userId },
  });

  const availableBalance = payments
    .filter((p) => p.status === 'available' || p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingBalance = payments
    .filter((p) => p.status === 'pending_review')
    .reduce((sum, p) => sum + p.amount, 0);

  // Fetch all open tasks
  const openTasks = await prisma.task.findMany({
    where: { status: 'open', isComingSoon: false, isFundingNeeded: false },
  });

  // Fetch campaign progress
  const campaign = await prisma.campaign.findUnique({
    where: { id: 'campaign-broadway' },
  });

  // Determine User State & Primary Card Details
  let primaryCard = {
    title: 'Earn nearby',
    desc: `${openTasks.length} paid tasks within 1 mile.`,
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
  else if (userId === 'worker-notasks-id') {
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
  else if (worker && worker.claims.length > 0) {
    const activeTask = worker.claims[0].task;
    primaryCard = {
      title: 'Finish your task',
      desc: `You still need an after photo for: ${activeTask.title}`,
      buttonText: 'Finish submission',
      link: `/worker/task/${activeTask.id}/active`,
      style: 'bg-emerald-700 text-white border-emerald-700',
      buttonStyle: 'bg-white text-emerald-800 hover:bg-emerald-50',
    };
  }
  // State 4: User has pending reviews (payment checking)
  else if (worker && worker.submissions.some((s) => s.status === 'submitted')) {
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

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-24">
      {/* Upper Status Banner */}
      <div className="bg-primary text-white p-6 rounded-b-[2rem] shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold font-heading">Good morning, {worker?.name || 'Austin'}.</h1>
            <p className="text-xs text-emerald-200 mt-0.5">Downtown Los Angeles Pilot</p>
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

        {/* Quest stack */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading flex items-center gap-1">
            <Flame size={12} className="text-[#2d6a4f]" />
            Today near you
          </h3>
          <div className="bg-[#faf9f5] border border-border rounded-2xl p-4 flex flex-col gap-3.5 text-xs font-semibold text-[#555]">
            <Link href="/worker/report" className="flex items-center justify-between border-b border-border/40 pb-2.5 hover:text-black">
              <span>1. Report one issue on your block</span>
              <span className="text-[#2d6a4f]">Earn up to $3</span>
            </Link>
            <Link href="/worker/training" className="flex items-center justify-between border-b border-border/40 pb-2.5 hover:text-black">
              <span>2. Finish safety training</span>
              <span className="text-primary">Unlock tasks</span>
            </Link>
            <Link href="/worker/map" className="flex items-center justify-between border-b border-border/40 pb-2.5 hover:text-black">
              <span>3. Check if planter on Main needs water</span>
              <span className="text-[#2d6a4f]">Earn $2</span>
            </Link>
            <Link href="/worker/map" className="flex items-center justify-between hover:text-black">
              <span>4. Join Saturday corridor team route</span>
              <span className="text-[#2d6a4f]">Estimated $45</span>
            </Link>
          </div>
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
                {Math.round((campaign.completedGoal / campaign.targetGoal) * 100)}%
              </span>
            </div>
            
            <p className="text-[11px] text-[#555] leading-relaxed">
              {campaign.description} Goal: {campaign.targetGoal} tasks. Currently: {campaign.completedGoal} done.
            </p>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${(campaign.completedGoal / campaign.targetGoal) * 100}%` }}
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
            <div className="text-[11px] text-[#555] leading-relaxed flex gap-2 items-start border-l-2 border-emerald-500 pl-3">
              <span>Someone cleaned litter near Oak St.</span>
            </div>
            <div className="text-[11px] text-[#555] leading-relaxed flex gap-2 items-start border-l-2 border-emerald-500 pl-3">
              <span>A planter route was completed on Broadway.</span>
            </div>
            <div className="text-[11px] text-[#555] leading-relaxed flex gap-2 items-start border-l-2 border-emerald-500 pl-3">
              <span>$18 was paid for a sidewalk cleanup task.</span>
            </div>
            <div className="text-[11px] text-[#555] leading-relaxed flex gap-2 items-start border-l-2 border-emerald-500 pl-3">
              <span>A new problem report came in near 7th & Main St.</span>
            </div>
          </div>
        </div>
      </div>

      <WorkerNav />
    </div>
  );
}
