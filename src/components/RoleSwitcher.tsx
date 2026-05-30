// src/components/RoleSwitcher.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, User as UserIcon, Layers, MapPin, Building2 } from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { useHydrated } from '@/lib/demo/hooks';
import type { Role } from '@/lib/demo/types';
import DemoControls from '@/components/demo/DemoControls';

const DEFAULT_USER_ID: Record<Role, string> = {
  worker: 'worker-austin-id',
  admin: 'admin-id',
  sponsor: 'sponsor-dtla',
};

export default function RoleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const persona = useDemoStore((s) => s.activePersona);
  const setPersona = useDemoStore((s) => s.setPersona);

  // Use a stable default until the store has hydrated to avoid mismatch.
  const role: Role = hydrated ? persona.role : 'worker';

  if (pathname === '/' || pathname === '/pitch') {
    return null;
  }

  const handlePersonaChange = (newRole: Role) => {
    setPersona(newRole, DEFAULT_USER_ID[newRole]);
    if (newRole === 'admin') router.push('/dashboard?view=review');
    if (newRole === 'worker') router.push('/worker/today');
    if (newRole === 'sponsor') router.push('/sponsor');
  };

  return (
    <div className="bg-primary/95 text-white py-1.5 px-4 flex items-center justify-between text-xs font-sans tracking-wide shadow-md border-b border-primary-hover sticky top-0 z-50">
      <div className="flex items-center gap-1.5 font-semibold text-emerald-100">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        CivicTree Development Bar
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors font-semibold">
          <Layers size={12} />
          Command Center
        </Link>
        <Link href="/worker/today" className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors font-semibold">
          <MapPin size={12} />
          Worker App
        </Link>
        <div className="w-px h-3 bg-emerald-700" />
        <DemoControls />
        <div className="w-px h-3 bg-emerald-700" />
        <span className="text-emerald-200">Persona:</span>
        <div className="flex bg-primary-hover rounded-full p-0.5 border border-primary/20">
          <button
            onClick={() => handlePersonaChange('worker')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all ${
              role === 'worker'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <UserIcon size={12} />
            Worker (Austin)
          </button>
          <button
            onClick={() => handlePersonaChange('admin')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all ${
              role === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Shield size={12} />
            Admin
          </button>
          <button
            onClick={() => handlePersonaChange('sponsor')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all ${
              role === 'sponsor'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Building2 size={12} />
            Sponsor
          </button>
        </div>
      </div>
    </div>
  );
}
