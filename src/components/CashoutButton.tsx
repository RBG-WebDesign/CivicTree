// src/components/CashoutButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

interface CashoutButtonProps {
  workerId: string;
  availableBalance: number;
}

export default function CashoutButton({ workerId, availableBalance }: CashoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCashout = async () => {
    if (availableBalance <= 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/payouts/cashout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cash out');
      }

      alert(`Success! Transferred $${availableBalance.toFixed(2)} to your card/bank account via Stripe Connect.`);
      router.refresh(); // Refresh page data
    } catch (err: any) {
      alert(err.message || 'Payout failed');
    } finally {
      setLoading(false);
    }
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
