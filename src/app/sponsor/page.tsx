// src/app/sponsor/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { DollarSign, BarChart3, Image as ImageIcon, MapPin, Download } from 'lucide-react';

export default function Sponsor() {
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
    { title: 'Budget remaining', value: '$1,240', desc: 'Real-time tracking of sponsored funds.' },
    { title: 'Tasks completed', value: '42 completed', desc: 'Verifiable physical tasks completed.' },
    { title: 'Paid to workers', value: '$1,840 paid', desc: 'Economic support routed directly locally.' },
    { title: 'Blocks improved', value: '8 blocks', desc: 'Cleaned and cleared corridors.' },
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

          {/* Dummy Dashboard Card */}
          <div className="bg-white border border-[#e6e8e4] rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {dashboardItems.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#888]">{item.title}</span>
                <span className="text-base font-extrabold text-foreground font-heading">{item.value}</span>
                <span className="text-[10px] text-muted">{item.desc}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-[#e6e8e4] pt-6 items-center justify-between text-xs text-[#666]">
            <div className="flex gap-2 items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-[#111]">“You fund the outcome. CivicTree manages the task flow.”</span>
            </div>
            <div className="flex gap-4">
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
