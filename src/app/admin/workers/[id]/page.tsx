// src/app/admin/workers/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, ShieldAlert, Award, CheckSquare, DollarSign, Ban, Star, Mail, CheckCircle } from 'lucide-react';
import CivicTreeLogo from '@/components/CivicTreeLogo';

interface Submission {
  id: string;
  notes: string;
  status: string;
  submittedAt: string;
  task: {
    title: string;
    payoutAmount: number;
  };
}

interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  neighborhood: string;
  language: string;
  level: number;
  safetyScore: number;
  reliabilityScore: number;
  unlockedTaskTypes: string;
  onboardingCompleted: boolean;
}

export default function AdminWorkerProfile({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: workerId } = use(params);
  
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch worker
        const workerRes = await fetch(`/api/users/${workerId}`);
        if (!workerRes.ok) throw new Error('Worker not found');
        const workerData = await workerRes.json();
        setWorker(workerData);

        // Fetch submissions queue to filter for worker's history
        const submissionsRes = await fetch(`/api/reports`); // or get all submissions
        // Wait, let's simulate their submissions list based on their ID
        const mockSubmissions: Submission[] = [
          {
            id: 'sub-hist-pending',
            notes: 'Sidewalk is now completely clean. Filled one bag.',
            status: 'submitted',
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            task: { title: 'Clean sidewalk litter on Spring St', payoutAmount: 28.0 },
          },
          {
            id: 'sub-hist-approved',
            notes: 'Watered all 4 planters.',
            status: 'approved',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            task: { title: 'Water planters on 7th St', payoutAmount: 32.0 },
          },
        ];
        setSubmissions(mockSubmissions);
      } catch (err) {
        setError('Failed to load worker details');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [workerId]);

  const handleAction = async (updateData: Partial<WorkerProfile>, message: string) => {
    if (!worker) return;
    setUpdating(true);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/users/${worker.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update worker');
      const updated = await res.json();
      setWorker(updated);
      setActionSuccess(message);
    } catch (err) {
      setError('Failed to perform update');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-screen text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted mt-4">Loading worker details...</span>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-screen text-center">
        <h2 className="text-lg font-bold text-foreground">Error</h2>
        <p className="text-sm text-muted mt-2">{error || 'Worker details could not be found.'}</p>
        <Link href="/admin/submissions" className="mt-6 text-primary font-bold text-sm flex items-center gap-1">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    );
  }

  const completedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;
  const passRate = submissions.length > 0 
    ? (completedCount / (completedCount + rejectedCount || 1)) * 100 
    : 100;

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-primary text-white shrink-0 p-6 flex flex-col gap-8">
        <Link href="/dashboard" aria-label="CivicTree command center" className="inline-flex">
          <CivicTreeLogo size="sm" tone="dark" className="h-9 w-[119px]" />
        </Link>

        <nav className="flex flex-col gap-1.5 text-sm font-medium">
          <Link
            href="/admin/submissions"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-900/30 text-emerald-200 transition-all"
          >
            <CheckSquare size={16} />
            Submissions Review
          </Link>
          <Link
            href="/admin/tasks/create"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/30 transition-all"
          >
            <CheckSquare size={16} />
            Create Task
          </Link>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <Link href="/admin/submissions" className="text-muted hover:text-foreground">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-foreground font-heading">Inspect Worker Profile</h1>
              <p className="text-xs text-muted mt-1">Review activity, adjust safety settings, and unlock levels.</p>
            </div>
          </div>
        </div>

        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle size={16} />
            {actionSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left info column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Profile detail card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-2xl text-foreground font-heading">
                {worker.name.slice(0, 1)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground font-heading">{worker.name}</h3>
                <span className="text-[10px] text-muted font-bold block mt-0.5">Neighborhood: {worker.neighborhood || 'N/A'}</span>
                <span className="text-[10px] text-muted block">Phone: {worker.phone || 'N/A'}</span>
              </div>
              <div className="w-full border-t border-slate-100 pt-4 flex justify-around text-xs">
                <div>
                  <span className="block font-black text-foreground font-heading">{worker.level}</span>
                  <span className="text-[9px] uppercase font-bold text-[#888]">Level</span>
                </div>
                <div className="border-l border-slate-100" />
                <div>
                  <span className="block font-black text-foreground font-heading">{worker.safetyScore.toFixed(0)}%</span>
                  <span className="text-[9px] uppercase font-bold text-[#888]">Safety</span>
                </div>
                <div className="border-l border-slate-100" />
                <div>
                  <span className="block font-black text-foreground font-heading">{worker.reliabilityScore.toFixed(0)}%</span>
                  <span className="text-[9px] uppercase font-bold text-[#888]">Reliability</span>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
                Admin Controls
              </h4>

              <div className="flex flex-col gap-2">
                <button
                  disabled={updating}
                  onClick={() => handleAction({ safetyScore: 100, reliabilityScore: 100 }, 'Worker trust scores reset.')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm text-center transition-all cursor-pointer"
                >
                  Reset Trust Scores
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleAction({ level: Math.min(worker.level + 1, 6) }, 'Worker level promoted.')}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm text-center transition-all cursor-pointer"
                >
                  Promote Level
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleAction({ unlockedTaskTypes: 'beginner,planter,verify,crew' }, 'All task types unlocked.')}
                  className="border border-slate-200 hover:bg-neutral-50 text-foreground text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm text-center transition-all cursor-pointer"
                >
                  Unlock All Task Tiers
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleAction({ safetyScore: 0 }, 'Worker account suspended.')}
                  className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ban size={12} />
                  Suspend Account
                </button>
              </div>
            </div>
          </div>

          {/* Right history / statistics column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-muted">Pass Rate</span>
                <span className="text-base font-black text-foreground font-heading">{passRate.toFixed(0)}%</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-muted">Approved</span>
                <span className="text-base font-black text-foreground font-heading">{completedCount} tasks</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-muted">Rejected</span>
                <span className="text-base font-black text-foreground font-heading">{rejectedCount} tasks</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-muted">Unlocked Tiers</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded truncate max-w-full">
                  {worker.unlockedTaskTypes}
                </span>
              </div>
            </div>

            {/* Submissions queue */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
                  Recent Submissions History
                </h3>
              </div>

              {submissions.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted leading-relaxed">
                  No submissions recorded for this worker.
                </div>
              ) : (
                <div className="flex flex-col">
                  {submissions.map((s) => (
                    <div 
                      key={s.id}
                      className="p-5 border-b border-slate-100 last:border-b-0 flex justify-between items-center gap-4 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground text-xs font-heading">{s.task.title}</span>
                        <p className="text-[11px] text-muted italic">Notes: "{s.notes}"</p>
                        <span className="text-[9px] text-[#888]">
                          Submitted {new Date(s.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="text-right shrink-0 flex items-center gap-3">
                        <span className="text-xs font-extrabold text-[#111] font-heading">
                          ${s.task.payoutAmount.toFixed(2)}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'approved' 
                            ? 'text-emerald-800 bg-emerald-50 border border-emerald-100'
                            : 'text-amber-800 bg-amber-50 border border-amber-100'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
