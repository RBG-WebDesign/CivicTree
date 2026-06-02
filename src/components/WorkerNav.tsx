// src/components/WorkerNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Map, AlertCircle, DollarSign, User, Home } from 'lucide-react';

export default function WorkerNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Menu', path: '/', icon: Home },
    { name: 'Today', path: '/worker/today', icon: Shield },
    { name: 'Map', path: '/worker/map', icon: Map },
    { name: 'Report', path: '/worker/report', icon: AlertCircle },
    { name: 'Earn', path: '/worker/earn', icon: DollarSign },
    { name: 'Profile', path: '/worker/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-border flex justify-around py-2.5 z-40 text-muted shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
        return (
          <Link 
            key={item.path}
            href={item.path} 
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              isActive ? 'text-[#1b4332]' : 'hover:text-[#1b4332]/80 opacity-60 hover:opacity-90'
            }`}
          >
            <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
            <span className="text-[9px] font-black tracking-wider uppercase">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
