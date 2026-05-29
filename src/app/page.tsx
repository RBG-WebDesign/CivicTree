// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, 
  Leaf, 
  Brush, 
  DollarSign, 
  Building2, 
  Menu, 
  Plus, 
  Star, 
  Check 
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const [role, setRole] = useState<string>('worker');

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const roleCookie = cookies.find((row) => row.startsWith('civictree_role='));
    if (roleCookie) {
      setRole(roleCookie.split('=')[1]);
    }
  }, []);

  const appLink = role === 'admin' ? '/admin/submissions' : '/worker/today';

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-white">
        <div className="hero-civic-shader absolute inset-y-0 left-0 w-full lg:w-[58%] pointer-events-none z-0" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6 relative z-10">
            {/* Badge Tag */}
            <div className="flex items-center gap-3 text-sm font-extrabold text-[#1b4332]">
              <span className="h-8 w-1.5 rounded-full bg-[#74c69d]" aria-hidden="true" />
              <Leaf size={17} className="text-[#2d6a4f]" />
              <span>Stronger blocks. Better cities. Paid.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-[3.5rem] font-extrabold tracking-tight text-[#111] leading-[1.15] font-heading">
              Get paid to fix <br />
              your neighborhood<span className="text-[#2d6a4f]">.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-[#555] leading-relaxed max-w-xl">
              CivicTree turns local cleanup and repair into paid civic tasks. Find nearby work, make money, and help your block look better.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <Link
                href={appLink}
                className="bg-[#1b4332] hover:bg-[#133024] text-white px-7 py-3.5 rounded-2xl font-extrabold transition-all shadow-lg shadow-[#1b4332]/10 flex items-center justify-center gap-2 text-sm"
              >
                <MapPin size={16} />
                Find tasks near me
              </Link>
              <Link
                href="/admin/tasks/create"
                className="bg-white hover:bg-neutral-50 text-[#333] border-2 border-[#eee] px-7 py-3.5 rounded-2xl font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                <Building2 size={16} className="text-[#666]" />
                Sponsor a block
              </Link>
            </div>
          </div>

          {/* Right Volunteer Photo Column for Mobile/Tablet */}
          <div className="lg:hidden w-full h-[300px] relative rounded-3xl overflow-hidden shadow-md border border-neutral-100">
            <Image
              src="/volunteers_working.png"
              alt="CivicTree volunteers working together"
              fill
              sizes="(max-width: 1023px) 100vw, 1px"
              loading="eager"
              className="object-cover"
            />
          </div>
        </div>

        {/* Desktop Absolute Image (Full-bleed right half) */}
        <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-1/2 h-full z-0">
          <div className="relative w-full h-full">
            <Image
              src="/volunteers_working.png"
              alt="CivicTree volunteers working together"
              fill
              sizes="(min-width: 1024px) 50vw, 1px"
              preload
              className="object-cover"
            />
            {/* Smooth left-to-right white gradient fade overlay */}
            <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </section>

      {/* Steps & Map Mockup Section */}
      <section id="how-it-works" className="px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
        {/* Large Container Card */}
        <div className="bg-white border border-[#eae8e2] rounded-[2.5rem] p-7 md:p-8 lg:p-10 xl:p-11 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-9 xl:gap-10 items-center">
          {/* Steps (Left Part of the Card) */}
          <div className="lg:col-span-7 flex flex-col md:grid md:grid-cols-3 gap-8 lg:gap-9">
            {/* Step 1 */}
            <div className="flex flex-col gap-4">
              <div className="w-[3.75rem] h-[3.75rem] md:w-16 md:h-16 rounded-3xl bg-[#e8f5e9] text-[#1b4332] flex items-center justify-center shadow-sm ring-1 ring-[#d8eadc]">
                <MapPin size={32} className="text-[#2d6a4f]" />
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-[#111] font-heading leading-tight">1. Open the map</h3>
              <p className="text-sm md:text-base text-[#666] leading-relaxed max-w-[14rem]">
                See nearby tasks on your block and beyond.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-4">
              <div className="w-[3.75rem] h-[3.75rem] md:w-16 md:h-16 rounded-3xl bg-[#e8f5e9] text-[#1b4332] flex items-center justify-center shadow-sm ring-1 ring-[#d8eadc]">
                <Brush size={30} className="text-[#2d6a4f]" />
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-[#111] font-heading leading-tight">2. Do the work</h3>
              <p className="text-sm md:text-base text-[#666] leading-relaxed max-w-[14rem]">
                Complete cleanup or repair tasks. Track your impact.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-4">
              <div className="w-[3.75rem] h-[3.75rem] md:w-16 md:h-16 rounded-3xl bg-[#e8f5e9] text-[#1b4332] flex items-center justify-center shadow-sm ring-1 ring-[#d8eadc]">
                <DollarSign size={30} className="text-[#2d6a4f]" />
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-[#111] font-heading leading-tight">3. Get paid</h3>
              <p className="text-sm md:text-base text-[#666] leading-relaxed max-w-[14rem]">
                Earn cash rewards and track your impact.
              </p>
            </div>
          </div>

          {/* Map Mockup (Right Part of the Card) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="bg-white border border-[#eae8e2] p-4 md:p-5 rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col gap-3">
              {/* Map Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Menu size={20} className="text-[#666]" />
                  <span className="text-sm md:text-base font-bold tracking-tight text-[#111] font-heading">Nearby tasks</span>
                  <span className="bg-[#e8f5e9] text-[#1b4332] text-xs px-2.5 py-1 rounded-full font-bold">12</span>
                </div>
                <Plus size={20} className="text-[#666]" />
              </div>

              {/* Map View */}
              <div className="h-48 md:h-52 bg-[#f4f3ed] rounded-3xl relative overflow-hidden border border-[#e5e3db]">
                {/* Stylized neighborhood map */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 420 240"
                  role="img"
                  aria-label="Neighborhood map graphic"
                  preserveAspectRatio="none"
                >
                  <rect width="420" height="240" fill="#f3f1e8" />
                  <path d="M0 58 C70 43 122 45 188 61 C250 76 312 78 420 54" fill="none" stroke="#fffaf1" strokeWidth="28" />
                  <path d="M-15 170 C55 148 128 153 191 174 C271 201 336 196 438 154" fill="none" stroke="#fffaf1" strokeWidth="30" />
                  <path d="M86 -24 C111 30 117 82 99 137 C87 172 89 205 109 264" fill="none" stroke="#fffaf1" strokeWidth="24" />
                  <path d="M255 -18 C235 50 241 99 281 141 C312 174 324 205 313 262" fill="none" stroke="#fffaf1" strokeWidth="26" />
                  <path d="M365 -12 C338 35 324 82 341 134 C355 177 354 214 336 259" fill="none" stroke="#fffaf1" strokeWidth="20" />
                  <path d="M0 58 C70 43 122 45 188 61 C250 76 312 78 420 54" fill="none" stroke="#dedbcc" strokeWidth="2" strokeDasharray="8 10" />
                  <path d="M-15 170 C55 148 128 153 191 174 C271 201 336 196 438 154" fill="none" stroke="#dedbcc" strokeWidth="2" strokeDasharray="8 10" />
                  <path d="M86 -24 C111 30 117 82 99 137 C87 172 89 205 109 264" fill="none" stroke="#dedbcc" strokeWidth="2" strokeDasharray="7 9" />
                  <path d="M255 -18 C235 50 241 99 281 141 C312 174 324 205 313 262" fill="none" stroke="#dedbcc" strokeWidth="2" strokeDasharray="7 9" />
                  <path d="M42 85 L85 75 L91 121 L48 133 Z" fill="#e6eee0" opacity="0.9" />
                  <path d="M132 82 L205 92 L197 142 L123 130 Z" fill="#eee8d7" opacity="0.95" />
                  <path d="M222 35 L288 47 L274 95 L211 84 Z" fill="#e6eee0" opacity="0.9" />
                  <path d="M308 84 L385 71 L396 119 L319 132 Z" fill="#eee8d7" opacity="0.95" />
                  <path d="M150 154 L215 176 L194 219 L130 198 Z" fill="#e6eee0" opacity="0.9" />
                  <path d="M292 162 L362 142 L381 190 L309 211 Z" fill="#e6eee0" opacity="0.85" />
                  <path d="M96 169 C143 147 190 155 226 181 C252 199 285 204 329 183" fill="none" stroke="#40916c" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 10" opacity="0.75" />
                  <text x="34" y="48" fill="#8a9489" fontSize="11" fontWeight="700">Oak St</text>
                  <text x="300" y="42" fill="#8a9489" fontSize="11" fontWeight="700">7th Ave</text>
                  <text x="38" y="198" fill="#8a9489" fontSize="11" fontWeight="700">Maple Walk</text>
                </svg>

                {/* Map Pins */}
                <div className="absolute top-10 left-14">
                  <div className="w-6 h-6 rounded-full bg-[#1b4332] border-2 border-white shadow-sm flex items-center justify-center" />
                </div>
                
                <div className="absolute top-32 left-40">
                  <div className="w-6 h-6 rounded-full bg-[#1b4332] border-2 border-white shadow-sm flex items-center justify-center" />
                </div>

                <div className="absolute top-12 right-[4.5rem]">
                  <div className="w-6 h-6 rounded-full bg-[#1b4332] border-2 border-white shadow-sm flex items-center justify-center animate-pulse" />
                </div>

                {/* User blue dot */}
                <div className="absolute bottom-[6.5rem] left-[58%] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md z-10" />
                  <div className="w-8 h-8 rounded-full bg-blue-400/30 absolute animate-ping pointer-events-none" />
                </div>

                {/* Floating task preview card */}
                <div className="absolute bottom-3 left-3 right-3 bg-white p-3.5 rounded-2xl shadow-lg border border-[#eee]/80 flex items-center gap-3.5">
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#eee]">
                    <Image
                      src="/task_thumbnail.png"
                      alt="Task thumbnail"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <span className="text-[11px] sm:text-xs md:text-sm font-extrabold text-[#111] leading-tight truncate">Oak St cleanup</span>
                    <span className="text-[11px] md:text-xs text-[#888] mt-0.5">0.2 mi away</span>
                  </div>

                  {/* Payout Tag */}
                  <div className="shrink-0 bg-[#e8f5e9] text-[#1b4332] text-xs font-extrabold px-2.5 py-1.5 rounded-xl">
                    $18
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar Section */}
      <section className="px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <div className="bg-[#f0f6f2] border border-[#dce8df] rounded-3xl px-6 py-5 md:px-8 md:py-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6 shadow-sm">
          {/* Stat 1 */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e1ece4] text-[#1b4332] flex items-center justify-center shrink-0">
              <Check size={22} className="text-[#2d6a4f]" />
            </div>
            <div className="min-w-0">
              <div className="text-xl md:text-2xl font-extrabold text-[#111] leading-none">3,200</div>
              <div className="text-xs md:text-[13px] text-[#555] font-semibold leading-tight mt-1">tasks completed</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e1ece4] text-[#1b4332] flex items-center justify-center shrink-0">
              <DollarSign size={22} className="text-[#2d6a4f]" />
            </div>
            <div className="min-w-0">
              <div className="text-xl md:text-2xl font-extrabold text-[#111] leading-none">$84k</div>
              <div className="text-xs md:text-[13px] text-[#555] font-semibold leading-tight mt-1">paid to workers</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e1ece4] text-[#1b4332] flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-[#2d6a4f]" />
            </div>
            <div className="min-w-0">
              <div className="text-xl md:text-2xl font-extrabold text-[#111] leading-none">128</div>
              <div className="text-xs md:text-[13px] text-[#555] font-semibold leading-tight mt-1">blocks improved</div>
            </div>
          </div>

          {/* Stat 4: Avatars & Stars */}
          <div className="flex items-center gap-4 min-w-0 sm:justify-start xl:justify-end">
            {/* Overlapping Avatars */}
            <div className="flex -space-x-3 shrink-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#1b4332] text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-sm">A</div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#2d6a4f] text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-sm">M</div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#40916c] text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-sm">J</div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#74c69d] text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-sm">K</div>
            </div>
            {/* Stars & Text */}
            <div className="flex flex-col items-start min-w-0">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="#e5a93b" stroke="#e5a93b" />
                ))}
              </div>
              <div className="text-xs md:text-[13px] text-[#555] font-bold leading-tight mt-1">4.9/5 from 1,250+ users</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
