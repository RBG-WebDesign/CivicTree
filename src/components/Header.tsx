'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CivicTreeLogo from './CivicTreeLogo';

export default function Header() {
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
    <header className="bg-white px-6 md:px-12 py-5 flex items-center justify-between max-w-7xl mx-auto w-full border-b border-[#eae8e2]/40">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3" aria-label="CivicTree home">
        <CivicTreeLogo size="md" />
      </Link>
      
      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#555]">
        <Link href="/how-it-works" className="hover:text-black transition-colors">How it works</Link>
        <Link href="/earn" className="hover:text-black transition-colors">Earn</Link>
        <Link href="/for-cities" className="hover:text-black transition-colors">For Cities</Link>
        <Link href="/sponsor" className="hover:text-black transition-colors">Sponsor</Link>
        <Link href="/dtla-pilot" className="hover:text-black transition-colors">DTLA Pilot</Link>
      </nav>

      {/* Action Button */}
      <div className="flex items-center gap-3">
        <Link
          href="/signin"
          className="border-2 border-[#eee] hover:bg-neutral-100 text-[#111] px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm"
        >
          Sign in
        </Link>
        <Link
          href={appLink}
          className="hidden sm:inline-block bg-[#1b4332] hover:bg-[#133024] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all"
        >
          Go to App
        </Link>
      </div>
    </header>
  );
}
