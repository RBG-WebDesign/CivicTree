// src/components/RoleSwitcher.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shield, User as UserIcon, Layers, MapPin } from 'lucide-react';

export default function RoleSwitcher() {
  const [role, setRole] = useState<string>('worker');

  useEffect(() => {
    // Read from cookies
    const cookies = document.cookie.split('; ');
    const roleCookie = cookies.find((row) => row.startsWith('civictree_role='));
    if (roleCookie) {
      setRole(roleCookie.split('=')[1]);
    } else {
      // Default to worker if not set
      document.cookie = 'civictree_role=worker; path=/';
      document.cookie = 'civictree_user_id=worker-austin-id; path=/';
      setRole('worker');
    }
  }, []);

  const handleRoleChange = (newRole: string) => {
    const userId = newRole === 'worker' ? 'worker-austin-id' : 'admin-id';
    document.cookie = `civictree_role=${newRole}; path=/`;
    document.cookie = `civictree_user_id=${userId}; path=/`;
    setRole(newRole);
    // Reload page to refresh server components and client context
    window.location.reload();
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
        <span className="text-emerald-200">Persona:</span>
        <div className="flex bg-primary-hover rounded-full p-0.5 border border-primary/20">
          <button
            onClick={() => handleRoleChange('worker')}
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
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full font-medium transition-all ${
              role === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Shield size={12} />
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
