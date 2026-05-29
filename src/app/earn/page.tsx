// src/app/earn/page.tsx
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { DollarSign, ShieldAlert, Sparkles, Check } from 'lucide-react';

export default function Earn() {
  const [waitlistStatus, setWaitlistStatus] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setWaitlistStatus('success');
    setEmail('');
  };

  const tasks = [
    { title: 'Pick up litter', pay: '$12 to $25', desc: 'Clean loose trash inside marked zones. Bags provided at depots.' },
    { title: 'Water planters', pay: '$15 to $30', desc: 'Care for sidewalk planters. Supplies and key are local.' },
    { title: 'Remove stickers from approved surfaces', pay: '$10 to $25', desc: 'Scrape stickers and wipe clean from city utility poles.' },
    { title: 'Help prep a corridor for an event', pay: '$20 to $60', desc: 'Prep clean blocks before neighborhood parades or markets.' },
    { title: 'Report hazards', pay: '$3 to $10', desc: 'Verify blocked pathways or street damage with a photo.' },
    { title: 'Join a team cleanup', pay: '$30 to $80', desc: 'Work with a crew for larger cleanups led by a Steward.' },
  ];

  const payStates = [
    { name: 'Pending review', desc: 'We check the photos to confirm the task is complete.' },
    { name: 'Approved', desc: 'Your work is verified and ready for payment processing.' },
    { name: 'Available', desc: 'Funds are in your balance and ready to cash out.' },
    { name: 'Paid', desc: 'Money transferred directly to your banking method.' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 w-full flex-1 flex flex-col gap-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#111] mb-6 font-heading">
            Earn money doing useful work near you.
          </h1>
          <p className="text-lg md:text-xl text-[#555] max-w-2xl mx-auto leading-relaxed">
            CivicTree pays people for small neighborhood tasks that make blocks cleaner, safer, and better cared for.
          </p>
        </div>

        {/* Task Examples Grid */}
        <div id="example-tasks" className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#2d6a4f]" />
            <h2 className="text-xl font-bold font-heading text-[#111]">Example Task Types</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((t, idx) => (
              <div 
                key={idx}
                className="bg-[#faf9f5] border border-[#e6e8e4] p-6 rounded-2xl flex flex-col justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-[#111] text-base font-heading">{t.title}</h3>
                    <span className="text-[#1b4332] bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 border border-emerald-100/60">
                      {t.pay}
                    </span>
                  </div>
                  <p className="text-xs text-[#555] mt-2 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Rules Box */}
        <div className="bg-amber-50 border border-amber-200/80 p-8 rounded-3xl flex flex-col gap-4 text-amber-900 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert size={24} className="text-amber-700 shrink-0" />
            <h3 className="font-extrabold text-lg text-amber-950 font-heading">We do not send beginners into dangerous work.</h3>
          </div>
          
          <p className="text-xs leading-relaxed text-amber-800">
            For your safety, strict guidelines apply. You must never touch or handle hazardous items:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-amber-950 mt-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
              Do not touch needles.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
              Do not touch human waste.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
              Do not touch chemicals.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
              Do not confront anyone.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
              Do not enter private property.
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
              Report unsafe things instead.
            </div>
          </div>
        </div>

        {/* Payment Block */}
        <div className="bg-white border border-[#e6e8e4] p-8 rounded-3xl flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="font-extrabold text-lg text-[#111] font-heading">Simple, transparent payment</h3>
            <p className="text-xs text-[#555] mt-1 leading-relaxed">
              Your task page tells you how much it pays before you start. Payments progress through clear states:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {payStates.map((s, idx) => (
              <div key={idx} className="flex flex-col gap-2 relative">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 border border-emerald-100">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold text-[#111] font-heading">{s.name}</span>
                </div>
                <p className="text-[11px] text-[#555] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist Sign Up Form */}
        <div className="bg-[#faf9f5] border border-[#e6e8e4] p-8 rounded-3xl shadow-sm text-center max-w-lg mx-auto w-full">
          <h3 className="font-extrabold text-lg text-[#111] font-heading mb-2">Join the worker waitlist</h3>
          <p className="text-xs text-[#555] mb-6 leading-relaxed">
            We are launching block-by-block. Join the list to get notified when tasks open in your neighborhood.
          </p>

          {waitlistStatus === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              <Check size={16} />
              You have been added to the waitlist! We will text you.
            </div>
          ) : (
            <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border border-[#e6e8e4] px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1b4332]"
              />
              <button
                type="submit"
                className="bg-[#1b4332] hover:bg-[#133024] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer"
              >
                Join waitlist
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
