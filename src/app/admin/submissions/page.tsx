'use client';

import Link from 'next/link';
import { Plus, CheckSquare, DollarSign, ArrowRight, Eye, Clock, Layers } from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { useHydrated } from '@/lib/demo/hooks';

export default function AdminSubmissions() {
  const submissions = useDemoStore((s) => s.submissions);
  const tasks = useDemoStore((s) => s.tasks);
  const workers = useDemoStore((s) => s.workers);
  const payments = useDemoStore((s) => s.payments);
  const hydrated = useHydrated();

  const sidebar = (
    <aside className="w-full md:w-64 bg-primary text-white shrink-0 p-6 flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white text-primary flex items-center justify-center font-bold text-lg font-heading">
          C
        </div>
        <span className="text-xl font-bold tracking-tight font-heading">CivicTree Admin</span>
      </div>

      <nav className="flex flex-col gap-1.5 text-sm font-medium">
        <Link
          href="/admin/submissions"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-950/40 text-emerald-100 transition-all"
        >
          <CheckSquare size={16} />
          Submissions Review
        </Link>
        <Link
          href="/admin/tasks/create"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/30 transition-all"
        >
          <Plus size={16} />
          Create Task
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/30 transition-all border-t border-emerald-800/30 mt-4 pt-4"
        >
          <Layers size={16} />
          Command Center
        </Link>
        <Link
          href="/worker/today"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/30 transition-all"
        >
          <ArrowRight size={16} />
          Worker App
        </Link>
      </nav>

      <div className="mt-auto text-[10px] text-emerald-300/60 font-medium">
        Downtown LA Pilot Console &bull; v1.0
      </div>
    </aside>
  );

  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50">
        {sidebar}
        <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted">Loading submissions...</span>
          </div>
        </main>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted');
  const totalPending = pendingSubmissions.length;
  const totalApproved = submissions.filter((s) => s.status === 'approved').length;
  const totalPaid = payments
    .filter((p) => p.status === 'available' || p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50">
      {sidebar}

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-foreground font-heading">Submissions Review</h1>
            <p className="text-xs text-muted mt-1">Review task proof photos and approve worker payouts.</p>
          </div>
          <Link
            href="/admin/tasks/create"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} />
            Create New Task
          </Link>
        </div>

        {/* Dashboard Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Pending Review</span>
              <span className="text-2xl font-black text-foreground font-heading">{totalPending}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Tasks Approved</span>
              <span className="text-2xl font-black text-foreground font-heading">{totalApproved}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2d6a4f] flex items-center justify-center">
              <CheckSquare size={20} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Total Paid Out</span>
              <span className="text-2xl font-black text-foreground font-heading">${totalPaid.toFixed(2)}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2d6a4f] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Submissions Table / Card List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
              Submissions Queue
            </h3>
            <span className="text-xs font-semibold text-[#1b4332] bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {pendingSubmissions.length} active
            </span>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted leading-relaxed">
              No submissions are currently pending review. Good work!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-muted uppercase font-bold tracking-wider border-b border-slate-200">
                    <th className="py-3 px-5">Task Details</th>
                    <th className="py-3 px-5">Worker</th>
                    <th className="py-3 px-5">Submitted At</th>
                    <th className="py-3 px-5 text-right">Payout</th>
                    <th className="py-3 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSubmissions.map((s) => {
                    const task = tasks.find((t) => t.id === s.taskId);
                    const worker = workers.find((w) => w.id === s.workerId);

                    const submittedDate = new Date(s.submittedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm font-heading">
                              {task?.title ?? 'Unknown Task'}
                            </span>
                            <span className="text-muted-foreground text-[10px] mt-0.5 max-w-sm truncate">
                              {task?.description ?? ''}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-semibold text-foreground">
                          {worker?.name ?? 'Unknown Worker'}
                        </td>
                        <td className="py-4 px-5 text-muted">{submittedDate}</td>
                        <td className="py-4 px-5 text-right font-bold text-primary text-sm font-heading">
                          ${(task?.payoutAmount ?? 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <Link
                            href={`/admin/submissions/${s.id}`}
                            className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 transition-all"
                          >
                            <Eye size={12} />
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
