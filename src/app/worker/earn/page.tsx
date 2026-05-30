// src/app/worker/earn/page.tsx
'use client';

import Link from 'next/link';
import WorkerNav from '@/components/WorkerNav';
import CashoutButton from '@/components/CashoutButton';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { workerBalances } from '@/lib/demo/selectors';
import { useHydrated } from '@/lib/demo/hooks';

export default function WorkerEarn() {
  const hydrated = useHydrated();

  const workerId = useDemoStore((s) => s.activePersona.userId);
  const workers = useDemoStore((s) => s.workers);
  const payments = useDemoStore((s) => s.payments);
  const submissions = useDemoStore((s) => s.submissions);
  const tasks = useDemoStore((s) => s.tasks);
  const state = useDemoStore();

  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto bg-[#faf9f5] min-h-screen border-x border-border shadow-sm pb-20">
        <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex items-center justify-between">
          <h1 className="text-sm font-bold tracking-tight text-foreground font-heading">Your Earnings</h1>
        </div>
        <WorkerNav />
      </div>
    );
  }

  const worker = workers.find((w) => w.id === workerId);
  const { available: availableBalance, pending: pendingBalance, lifetime: lifetimeEarned } = workerBalances(state, workerId);

  const workerPayments = payments
    .filter((p) => p.workerId === workerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-[#faf9f5] min-h-screen border-x border-border shadow-sm pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex items-center justify-between">
        <h1 className="text-sm font-bold tracking-tight text-foreground font-heading">Your Earnings</h1>
        <span className="text-xs text-muted font-medium">{worker?.name || 'Austin'}</span>
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Wallet Balances Card */}
        <div className="bg-white border border-border p-6 rounded-3xl shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Available Balance</span>
              <div className="text-3xl font-black text-primary font-heading mt-1">${availableBalance.toFixed(2)}</div>
            </div>
            <CashoutButton workerId={workerId} availableBalance={availableBalance} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Pending Review</span>
              <div className="text-base font-bold text-foreground mt-1">${pendingBalance.toFixed(2)}</div>
            </div>
            <div className="border-l border-border pl-4">
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Lifetime Earned</span>
              <div className="text-base font-bold text-foreground mt-1">${lifetimeEarned.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white border border-border p-4 rounded-2xl text-xs text-muted leading-relaxed">
          <p className="font-semibold text-foreground mb-1">Most reviews take under an hour.</p>
          We compare your before and after photos. If they look good, the money is moved to your available balance. If we need more proof, we will alert you.
        </div>

        {/* Transaction History */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">Work History</h3>

          {workerPayments.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center text-xs text-muted bg-white">
              No tasks completed yet. Find a task on the map and do good work!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {workerPayments.map((p) => {
                const submission = submissions.find((s) => s.id === p.submissionId);
                const task = tasks.find((t) => t.id === submission?.taskId);
                const taskTitle = task?.title ?? 'Task';
                const dateString = new Date(p.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-border p-4 rounded-2xl shadow-sm flex justify-between items-center gap-4"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <h4 className="text-xs font-bold text-foreground line-clamp-1 font-heading">
                        {taskTitle}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted">
                        <span>{dateString}</span>
                        <span>&bull;</span>
                        {p.status === 'pending_review' && (
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                            <Clock size={8} />
                            Checking photos
                          </span>
                        )}
                        {p.status === 'available' && (
                          <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                            <CheckCircle2 size={8} />
                            Approved
                          </span>
                        )}
                        {p.status === 'paid' && (
                          <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                            <CheckCircle2 size={8} />
                            Paid
                          </span>
                        )}
                        {p.status === 'rejected' && (
                          <span className="text-destructive bg-red-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                            <AlertTriangle size={8} />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-extrabold font-heading ${
                        p.status === 'rejected' ? 'text-muted-foreground line-through' : 'text-primary'
                      }`}>
                        ${p.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WorkerNav />
    </div>
  );
}
