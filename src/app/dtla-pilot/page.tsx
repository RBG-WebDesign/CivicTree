// src/app/dtla-pilot/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Target, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export default function DTLAPilot() {
  const focusAreas = [
    'Transit corridors',
    'Alleys',
    'Planters',
    'Sidewalks',
    'Business corridors',
    'Event routes',
    'High-need blocks',
  ];

  const firstTasks = [
    'Litter pickup',
    'Planter care',
    'Photo reports',
    'Sticker removal',
    'Supervised team cleanup',
  ];

  const pilotGoals = [
    'Pay local workers',
    'Clean visible corridors',
    'Reduce small blight',
    'Improve public-space trust',
    'Test AI-assisted verification',
    'Build a repeatable model',
  ];

  const pilotMetrics = [
    'People paid',
    'Tasks completed',
    'Blocks improved',
    'Bags removed',
    'Reports resolved',
    'Average approval time',
    'Payment speed',
    'Worker retention',
    'Safety incidents',
    'Cost per completed task',
    'Resident sentiment',
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 w-full flex-1 flex flex-col gap-16">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111] mb-6 font-heading">
            A cleaner DTLA, block by block.
          </h1>
          <p className="text-lg md:text-xl text-[#555] max-w-2xl mx-auto leading-relaxed">
            CivicTree is starting with a simple test: can we pay people to make downtown Los Angeles visibly better?
          </p>
        </div>

        {/* Focus Areas & Task Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Focus Areas */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold font-heading text-[#111] flex items-center gap-2">
              <Target size={18} className="text-[#2d6a4f]" />
              Pilot Area (10 to 20 blocks)
            </h2>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area, idx) => (
                <span 
                  key={idx}
                  className="bg-[#faf9f5] border border-[#e6e8e4] text-[#1c281e] px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Task Types */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold font-heading text-[#111] flex items-center gap-2">
              <Award size={18} className="text-[#2d6a4f]" />
              First Task Types
            </h2>
            <div className="flex flex-wrap gap-2">
              {firstTasks.map((task, idx) => (
                <span 
                  key={idx}
                  className="bg-emerald-50 text-emerald-900 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  {task}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Goals & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Goals */}
          <div className="flex flex-col gap-4 bg-[#faf9f5] border border-[#e6e8e4] p-6 rounded-2xl">
            <h3 className="text-base font-bold font-heading text-[#111] flex items-center gap-2">
              <TrendingUp size={16} className="text-[#2d6a4f]" />
              Pilot Goals
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-[#555] font-semibold mt-2">
              {pilotGoals.map((goal, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-[#2d6a4f]">&bull;</span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics */}
          <div className="flex flex-col gap-4 bg-[#faf9f5] border border-[#e6e8e4] p-6 rounded-2xl">
            <h3 className="text-base font-bold font-heading text-[#111] flex items-center gap-2">
              <TrendingUp size={16} className="text-[#2d6a4f]" />
              Tracked Metrics
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#555] font-bold mt-2">
              {pilotMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0" />
                  {metric}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/sponsor"
            className="bg-[#1b4332] hover:bg-[#133024] text-white px-8 py-4 rounded-2xl font-extrabold transition-all shadow-md text-sm w-full sm:w-auto text-center"
          >
            Help fund the pilot
          </Link>
          <Link
            href="/earn"
            className="bg-white hover:bg-neutral-50 text-[#333] border-2 border-[#eee] px-8 py-4 rounded-2xl font-extrabold transition-all text-sm w-full sm:w-auto text-center"
          >
            Join the waitlist
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
