'use client';

// src/app/sponsor/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Image as ImageIcon, MapPin, Sparkles, WalletCards } from 'lucide-react';
import { useHydrated } from '@/lib/demo/hooks';
import { useDemoStore } from '@/lib/demo/store';
import { campaignProgress } from '@/lib/demo/selectors';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function Sponsor() {
  const hydrated = useHydrated();
  const state = useDemoStore((s) => s);
  const campaign = state.campaigns.find((c) => c.id === 'campaign-broadway');
  const downtown = state.neighborhoods.find((n) => n.id === 'downtown');
  const progress = hydrated ? campaignProgress(state, 'campaign-broadway') : 42;
  const completedGoal = hydrated ? campaign?.completedGoal ?? 0 : 42;
  const remainingBudget = hydrated ? campaign?.remainingBudget ?? 0 : 3160;
  const paidTotal = hydrated ? downtown?.paidTotal ?? 0 : 4200;
  const blocksImproved = hydrated ? downtown?.blocksImproved ?? 0 : 18;
  const approvedProofs = state.submissions
    .filter((s) => s.status === 'approved')
    .slice(-3)
    .reverse()
    .map((submission) => ({
      submission,
      task: state.tasks.find((task) => task.id === submission.taskId),
    }));

  const options = [
    'Sponsor a block',
    'Fund a cleanup day',
    'Support local workers',
    'Prepare an event corridor',
    'Restore planters',
    'Fund reports and documentation',
    'Match donations for high-need areas',
  ];

  const examples = [
    { amount: '$250', title: 'Sponsor a block', desc: 'Funds small cleanup and litter tasks to keep a local block clean.' },
    { amount: '$1,000', title: 'Reset a corridor', desc: 'Preps or maintains event lanes, removing stickers and trash.' },
    { amount: '$10,000', title: 'Neighborhood campaign', desc: 'Supports a coordinated multi-block effort for weeks.' },
    { amount: '$50,000', title: 'Public-space push', desc: 'Funds comprehensive corridor beautification and planter restores.' },
  ];

  const dashboardItems = [
    { title: 'Demo budget remaining', value: money.format(remainingBudget), desc: 'Live funding pool for this simulated campaign.' },
    { title: 'Tasks completed', value: `${completedGoal} completed`, desc: 'Verified physical tasks completed in the demo loop.' },
    { title: 'Demo payouts tracked', value: `${money.format(paidTotal)} paid`, desc: 'Simulated local earnings routed through CivicTree.' },
    { title: 'Blocks improved', value: `${blocksImproved} blocks`, desc: 'Cleaned and cared-for corridors.' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 w-full flex-1 flex flex-col gap-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111] mb-6 font-heading">
            Sponsor work people can see.
          </h1>
          <p className="text-lg md:text-xl text-[#555] max-w-2xl mx-auto leading-relaxed">
            Put money into a block, corridor, or neighborhood campaign. CivicTree turns your budget into paid local tasks with proof.
          </p>
        </div>

        {/* Sponsor Options */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold font-heading text-[#111]">Sponsorship options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {options.map((opt, idx) => (
              <div 
                key={idx}
                className="border border-[#e6e8e4] bg-[#faf9f5] px-5 py-4 rounded-xl text-sm font-bold text-[#111] shadow-sm flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] shrink-0" />
                {opt}
              </div>
            ))}
          </div>
        </div>

        {/* Funding Levels */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold font-heading text-[#111]">Example funding</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {examples.map((ex, idx) => (
              <div 
                key={idx}
                className="border border-[#e6e8e4] bg-white p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="text-2xl font-black text-primary font-heading">{ex.amount}</div>
                  <h3 className="font-extrabold text-sm text-[#111] mt-2 font-heading">{ex.title}</h3>
                  <p className="text-[11px] text-[#555] mt-1 leading-relaxed">{ex.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-[#faf9f5] border border-[#e6e8e4] p-8 rounded-[2rem] shadow-sm flex flex-col gap-6">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Transparency
            </span>
            <h3 className="font-extrabold text-xl text-[#111] mt-3 font-heading">Verify the outcome in real time</h3>
            <p className="text-xs text-[#555] mt-1 leading-relaxed">
              Every dollar spent maps directly to photo proof and GPS confirmation. Review before-and-after reports directly.
            </p>
          </div>

          <div className="bg-white border border-[#e6e8e4] rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {dashboardItems.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">{item.title}</span>
                <span className="text-base font-extrabold text-foreground font-heading">{item.value}</span>
                <span className="text-[10px] text-muted">{item.desc}</span>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#e6e8e4] rounded-2xl p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#1b4332]">
                  <Sparkles size={14} />
                  Live demo impact
                </div>
                <h4 className="mt-2 font-heading text-lg font-extrabold text-[#111]">
                  {campaign?.title ?? 'Broadway Block Reset'}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[#555]">
                  The funding pool, approvals, and proof thumbnails update as the demo loop runs.
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="font-heading text-3xl font-black text-[#1b4332]">{progress}%</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#777]">campaign complete</div>
              </div>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-[#edf1ec]">
              <div
                className="h-full rounded-full bg-[#2d6a4f] transition-all"
                style={{ width: `${Math.min(100, progress)}%` }}
                aria-label={`${progress}% campaign complete`}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {approvedProofs.map(({ submission, task }) => (
                <div key={submission.id} className="overflow-hidden rounded-xl border border-[#e6e8e4] bg-[#faf9f5]">
                  <img
                    src={submission.afterPhoto}
                    alt={`Approved proof for ${task?.title ?? 'demo task'}`}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="line-clamp-1 text-xs font-extrabold text-[#111]">{task?.title ?? 'Approved task'}</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#2d6a4f]">Approved proof</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-[#e6e8e4] pt-6 items-center justify-between text-xs text-[#666]">
            <div className="flex gap-2 items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-[#111]">You fund the outcome. CivicTree manages the task flow.</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1 font-semibold text-[#1b4332]">
                <WalletCards size={12} />
                Demo payout ledger
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#1b4332]">
                <ImageIcon size={12} />
                Before/after photo audit
              </span>
              <span className="flex items-center gap-1 font-semibold text-[#1b4332]">
                <MapPin size={12} />
                GPS map verification
              </span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="mailto:sponsor@civictree.org"
            className="bg-[#1b4332] hover:bg-[#133024] text-white px-8 py-4 rounded-2xl font-extrabold transition-all shadow-md text-sm w-full sm:w-auto text-center animate-pulse"
          >
            Sponsor a block
          </Link>
          <Link
            href="mailto:sponsor@civictree.org?subject=Campaign%20Plan"
            className="bg-white hover:bg-neutral-50 text-[#333] border-2 border-[#eee] px-8 py-4 rounded-2xl font-extrabold transition-all text-sm w-full sm:w-auto text-center"
          >
            Request a campaign plan
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
