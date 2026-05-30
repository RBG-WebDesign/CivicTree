'use client';

// src/app/for-cities/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Building2, ShieldAlert, CheckSquare, Settings, Route, WalletCards } from 'lucide-react';
import { useHydrated } from '@/lib/demo/hooks';
import { useDemoStore } from '@/lib/demo/store';
import { neighborhoodImpact } from '@/lib/demo/selectors';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function ForCities() {
  const hydrated = useHydrated();
  const state = useDemoStore((s) => s);
  const neighborhoods = hydrated ? neighborhoodImpact(state) : [];
  const visibleNeighborhoods = neighborhoods.slice(0, 5);
  const totals = neighborhoods.reduce(
    (acc, n) => ({
      completed: acc.completed + n.tasksCompleted,
      paid: acc.paid + n.paidTotal,
      blocks: acc.blocks + n.blocksImproved,
      reports: acc.reports + n.openReports,
    }),
    { completed: 0, paid: 0, blocks: 0, reports: 0 },
  );

  const useCases = [
    '311 triage',
    'Litter cleanup',
    'Planter care',
    'Corridor beautification',
    'Event readiness',
    'Business district support',
    'Workforce development',
    'Public-space maintenance',
    'Neighborhood reporting',
  ];

  const cityControls = [
    'Approved task types',
    'Safety rules',
    'No-work zones',
    'Permission rules',
    'Review requirements',
    'Partner access',
    'Campaign budgets',
    'Public dashboards',
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 w-full flex-1 flex flex-col gap-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111] mb-6 font-heading">
            Turn neighborhood problems into verified work.
          </h1>
          <p className="text-lg md:text-xl text-[#555] max-w-2xl mx-auto leading-relaxed">
            CivicTree helps cities and local partners turn small public-space needs into safe, paid, trackable tasks.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold font-heading text-[#111] flex items-center gap-2">
            <CheckSquare size={20} className="text-[#2d6a4f]" />
            Use Cases
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {useCases.map((useCase, idx) => (
              <div 
                key={idx}
                className="bg-[#faf9f5] border border-[#e6e8e4] px-5 py-4 rounded-xl text-sm font-semibold text-[#111] shadow-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] shrink-0" />
                {useCase}
              </div>
            ))}
          </div>
        </div>

        {/* City Controls Section */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold font-heading text-[#111] flex items-center gap-2">
            <Settings size={20} className="text-[#2d6a4f]" />
            City Controls
          </h2>
          <p className="text-xs text-[#555] -mt-4 leading-relaxed">
            The city stays in control of what work is allowed. You specify the guidelines, and we enforce them in the field.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {cityControls.map((control, idx) => (
              <div 
                key={idx}
                className="border border-[#e6e8e4] px-4 py-3.5 rounded-xl text-xs font-bold text-[#555] bg-white flex items-center justify-between"
              >
                <span>{control}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#e6e8e4] bg-[#faf9f5] p-8 rounded-3xl shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#1b4332]">
                <Building2 size={14} />
                Live demo city impact
              </div>
              <h2 className="mt-2 text-xl font-bold font-heading text-[#111]">Neighborhood rollup from verified work</h2>
              <p className="mt-1 text-xs text-[#555] leading-relaxed">
                These numbers come from the local demo store and update when admins approve work.
              </p>
            </div>
            <div className="text-xs font-bold text-[#555]">
              {hydrated ? `${neighborhoods.length} seeded neighborhoods` : 'Loading demo impact'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Verified tasks', value: totals.completed.toLocaleString(), icon: CheckSquare },
              { label: 'Demo payouts', value: money.format(totals.paid), icon: WalletCards },
              { label: 'Blocks improved', value: totals.blocks.toLocaleString(), icon: Route },
              { label: 'Open reports', value: totals.reports.toLocaleString(), icon: ShieldAlert },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-[#e6e8e4] bg-white p-4">
                <div className="flex items-center justify-between text-[#2d6a4f]">
                  <span className="text-[9px] uppercase tracking-wider font-black text-[#777]">{label}</span>
                  <Icon size={15} />
                </div>
                <div className="mt-3 font-heading text-2xl font-black text-[#111]">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-3">
            {visibleNeighborhoods.map((n) => (
              <div key={n.id} className="rounded-2xl border border-[#e6e8e4] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-heading text-sm font-extrabold text-[#111]">{n.name}</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#2d6a4f]">
                      Level {n.level} / {n.state}
                    </div>
                  </div>
                  <div className="text-right text-xs font-bold text-[#555]">
                    {n.tasksCompleted} tasks
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-[#555]">
                  <span>{money.format(n.paidTotal)} demo paid</span>
                  <span>{n.blocksImproved} blocks</span>
                  <span>{n.openReports} open reports</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Declarations */}
        <div className="bg-amber-50 border border-amber-200/80 p-8 rounded-3xl flex flex-col gap-4 text-amber-900 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert size={24} className="text-amber-700 shrink-0" />
            <h3 className="font-extrabold text-lg text-amber-950 font-heading">Partnering safely with public works</h3>
          </div>
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-amber-800 font-semibold">
            <div className="flex gap-2 items-start">
              <span className="text-amber-700 font-bold">&bull;</span>
              <span>CivicTree does not replace professional city workers.</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-amber-700 font-bold">&bull;</span>
              <span>Hazardous and high-risk work is routed to trained professional teams.</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-amber-700 font-bold">&bull;</span>
              <span>All workflows require verification and photo audits before worker payouts occur.</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="mailto:partner@civictree.org"
            className="bg-[#1b4332] hover:bg-[#133024] text-white px-8 py-4 rounded-2xl font-extrabold transition-all shadow-md text-sm w-full sm:w-auto text-center"
          >
            Talk to us about a pilot
          </Link>
          <Link
            href="/dtla-pilot"
            className="bg-white hover:bg-neutral-50 text-[#333] border-2 border-[#eee] px-8 py-4 rounded-2xl font-extrabold transition-all text-sm w-full sm:w-auto text-center"
          >
            See the DTLA model
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
