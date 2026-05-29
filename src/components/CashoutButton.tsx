// src/components/CashoutButton.tsx
'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { useToast } from '@/components/demo/Toast';

interface CashoutButtonProps {
  workerId: string;
  availableBalance: number;
}

export default function CashoutButton({ workerId, availableBalance }: CashoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const cashOut = useDemoStore((s) => s.cashOut);
  const { notify } = useToast();

  const handleCashout = () => {
    if (availableBalance <= 0) return;
    setLoading(true);
    cashOut(workerId);
    notify(`$${availableBalance.toFixed(2)} sent to your account.`, 'success');
    setLoading(false);
  };

  if (availableBalance <= 0) {
    return (
      <button
        disabled
        className="bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl cursor-not-allowed flex items-center gap-1"
      >
        Cash Out
        <ArrowUpRight size={14} />
      </button>
    );
  }

  return (
    <button
      onClick={handleCashout}
      disabled={loading}
      className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1 transition-all cursor-pointer"
    >
      {loading ? 'Processing...' : 'Cash Out'}
      <ArrowUpRight size={14} />
    </button>
  );
}
