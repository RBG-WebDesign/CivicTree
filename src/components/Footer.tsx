// src/components/Footer.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Footer() {
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
    <footer className="py-10 px-6 max-w-7xl mx-auto w-full border-t border-[#eae8e2]/60 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#888] font-medium">
        <div>
          &copy; {new Date().getFullYear()} CivicTree. Built for safe neighborhood care.
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
          <Link href="/how-it-works" className="hover:text-black transition-colors">How it works</Link>
          <Link href="/earn" className="hover:text-black transition-colors">Earn Money</Link>
          <Link href="/for-cities" className="hover:text-black transition-colors">For Cities</Link>
          <Link href="/sponsor" className="hover:text-black transition-colors">Sponsors</Link>
          <Link href="/dtla-pilot" className="hover:text-black transition-colors">DTLA Pilot</Link>
          <Link href={appLink} className="hover:text-black transition-colors">Worker App</Link>
          <Link href="/admin" className="hover:text-black transition-colors">Admin Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
