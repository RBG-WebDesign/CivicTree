// src/app/how-it-works/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MapPin, Search, Hammer, Camera, DollarSign, BarChart3, ShieldAlert } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: 1,
      title: 'Open the map.',
      desc: 'See paid tasks near you. Some are quick. Some need a crew. Some need training.',
      icon: MapPin,
    },
    {
      num: 2,
      title: 'Pick a task.',
      desc: 'Each task shows the pay, time, tools, safety rules, and what proof is needed.',
      icon: Search,
    },
    {
      num: 3,
      title: 'Do the work.',
      desc: 'Follow the instructions. Stay inside the marked area. Do not touch unsafe stuff.',
      icon: Hammer,
    },
    {
      num: 4,
      title: 'Submit proof.',
      desc: 'Take before and after photos. Add notes if something changed.',
      icon: Camera,
    },
    {
      num: 5,
      title: 'Get paid.',
      desc: 'Once the task is checked, your payment moves to your balance.',
      icon: DollarSign,
    },
    {
      num: 6,
      title: 'See the impact.',
      desc: 'Your profile shows blocks improved, tasks completed, and money earned.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 w-full flex-1">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111] mb-6 font-heading">
            How CivicTree works
          </h1>
          <p className="text-lg md:text-xl text-[#555] max-w-2xl mx-auto leading-relaxed">
            Open the map. Pick a paid task. Do the work safely. Submit proof. Get paid.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className="bg-[#faf9f5] border border-[#e6e8e4] p-8 rounded-3xl flex gap-6 items-start shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Icon size={24} className="text-[#2d6a4f]" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#888] uppercase tracking-wider">Step {step.num}</span>
                  <h3 className="text-lg font-bold text-[#111] font-heading">{step.title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safety Section */}
        <div id="safety" className="bg-amber-50 border border-amber-200/80 p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-start text-amber-900 mb-16 shadow-sm">
          <ShieldAlert size={32} className="text-amber-700 shrink-0" />
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-lg text-amber-950 font-heading">Safety is always first</h3>
            <p className="text-sm leading-relaxed text-amber-800">
              We never ask you to do hazardous work. Do not touch needles, biohazards, or chemicals. Stay off active streets and respect private boundaries. If you report a hazard, you can still get paid for a valid photo report without touching it.
            </p>
          </div>
        </div>

        {/* CTA Stack */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/worker/today"
            className="bg-[#1b4332] hover:bg-[#133024] text-white px-8 py-4 rounded-2xl font-extrabold transition-all shadow-md text-sm w-full sm:w-auto text-center"
          >
            Find tasks near me
          </Link>
          <a
            href="#safety"
            className="bg-white hover:bg-neutral-50 text-[#333] border-2 border-[#eee] px-8 py-4 rounded-2xl font-extrabold transition-all text-sm w-full sm:w-auto text-center"
          >
            Read safety rules
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
