// src/app/worker/profile/page.tsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import WorkerNav from '@/components/WorkerNav';
import { Award, ShieldCheck, Heart, Landmark, Globe, HelpCircle, AlertTriangle } from 'lucide-react';

export const revalidate = 0;

export default async function WorkerProfile() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('civictree_user_id')?.value || 'worker-austin-id';

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const levelNames = ['Seed', 'Sprout', 'Branch', 'Grove', 'Steward', 'City Steward'];
  const levelNum = user?.level || 1;
  const levelName = levelNames[Math.min(levelNum - 1, levelNames.length - 1)];

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-border py-4 px-6 sticky top-[38px] z-10">
        <h1 className="text-sm font-bold tracking-tight text-foreground font-heading">Your Profile</h1>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* User Card */}
        <div className="flex items-center gap-4 bg-[#faf9f5] border border-border p-5 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-xl font-heading shadow-md">
            {user?.name?.slice(0, 1) || 'A'}
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-extrabold text-foreground font-heading">{user?.name || 'Austin'}</h2>
            <p className="text-xs text-muted">Neighborhood: {user?.neighborhood || 'Historic Core'}</p>
            <p className="text-[10px] text-muted-foreground">Phone: {user?.phone || '213-555-0199'}</p>
          </div>
        </div>

        {/* Level Card */}
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
            {levelNum === 1 
              ? 'Complete basic training to unlock planter routes.' 
              : 'You have unlocked planter routes and longer cleanup routes.'}
          </p>

          <div className="w-full bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all" 
              style={{ width: `${levelNum === 1 ? 25 : 60}%` }}
            />
          </div>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Safety Score</span>
            <span className="text-lg font-black text-[#2d6a4f] font-heading">{user?.safetyScore.toFixed(0)}%</span>
            <span className="text-[9px] text-[#555]">Zero safety incidents</span>
          </div>
          <div className="border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">Reliability Score</span>
            <span className="text-lg font-black text-[#2d6a4f] font-heading">{user?.reliabilityScore.toFixed(1)}%</span>
            <span className="text-[9px] text-[#555]">High task success rate</span>
          </div>
        </div>

        {/* Settings List */}
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
            <span className="text-[10px] text-muted uppercase tracking-wider font-bold">
              {user?.language === 'es' ? 'Español' : user?.language === 'zh' ? '中文' : 'English'}
            </span>
          </div>
        </div>

        {/* Support & Account Status */}
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
        </div>
      </div>

      <WorkerNav />
    </div>
  );
}
