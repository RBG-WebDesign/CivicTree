// src/app/worker/task/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle, XCircle, Briefcase, Hammer, MapPin } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  payoutAmount: number;
  estimatedMinutes: number;
  requiredTools: string;
  safetyNotes: string;
  doList: string;
  dontList: string;
  latitude: number;
  longitude: number;
}

export default function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: taskId } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await fetch(`/api/tasks`);
        if (!res.ok) throw new Error('Failed to load tasks');
        const tasks: Task[] = await res.json();
        const found = tasks.find((t) => t.id === taskId);
        if (!found) {
          setError('Task not found');
        } else {
          setTask(found);
        }
      } catch (err) {
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    }
    fetchTask();
  }, [taskId]);

  const handleClaim = async () => {
    if (!task) return;
    setClaiming(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks/${task.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId: 'worker-austin-id', // Mock active worker
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to claim task');
      }

      // Success, route to the active workspace page
      router.push(`/worker/task/${task.id}/active`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted mt-4">Loading task details...</span>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border text-center">
        <XCircle size={40} className="text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground">Error</h2>
        <p className="text-sm text-muted mt-2">{error || 'Task details could not be found.'}</p>
        <Link
          href="/worker/today"
          className="mt-6 inline-flex items-center gap-1 text-primary font-bold text-sm"
        >
          <ArrowLeft size={16} />
          Go back to Today
        </Link>
      </div>
    );
  }

  const doItems = task.doList ? task.doList.split(',').map((s) => s.trim()) : [];
  const dontItems = task.dontList ? task.dontList.split(',').map((s) => s.trim()) : [];
  const tools = task.requiredTools ? task.requiredTools.split(',').map((s) => s.trim()) : [];

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-[#faf9f5] min-h-screen border-x border-border shadow-sm pb-8">
      {/* Top Navigation */}
      <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex items-center gap-4">
        <Link href="/worker/today" className="text-muted hover:text-foreground shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold tracking-tight text-foreground line-clamp-1 font-heading">Task Details</h1>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Payout & Title Card */}
        <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {task.estimatedMinutes} mins
            </span>
            <div className="text-right">
              <span className="text-2xl font-black text-primary font-heading">${task.payoutAmount.toFixed(2)}</span>
              <span className="block text-[9px] uppercase tracking-wider text-muted font-bold mt-0.5">Estimated Pay</span>
            </div>
          </div>
          
          <h2 className="text-lg font-bold text-foreground leading-snug font-heading">{task.title}</h2>
          <p className="text-xs text-muted leading-relaxed">{task.description}</p>
        </div>

        {/* Tools Needed */}
        {tools.length > 0 && (
          <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading flex items-center gap-1.5">
              <Hammer size={14} className="text-primary" />
              Required Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool, idx) => (
                <span key={idx} className="bg-slate-50 border border-slate-200/60 text-slate-800 px-3 py-1 rounded-xl text-xs font-medium">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Safety Warnings Banner */}
        <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-3xl flex gap-3 text-amber-900 shadow-sm">
          <ShieldAlert size={22} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-sm">Safety instructions:</span>
            <p className="leading-relaxed text-amber-800">{task.safetyNotes}</p>
          </div>
        </div>

        {/* Do and Don't Lists */}
        <div className="grid grid-cols-1 gap-4">
          {/* Do List */}
          {doItems.length > 0 && (
            <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f] font-heading flex items-center gap-1.5">
                <CheckCircle size={14} />
                Do List
              </h3>
              <ul className="flex flex-col gap-2">
                {doItems.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted flex gap-2 items-start leading-relaxed">
                    <span className="text-[#2d6a4f] font-bold mt-0.5">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Don't List */}
          {dontItems.length > 0 && (
            <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-destructive font-heading flex items-center gap-1.5">
                <XCircle size={14} />
                Do Not List
              </h3>
              <ul className="flex flex-col gap-2">
                {dontItems.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted flex gap-2 items-start leading-relaxed">
                    <span className="text-destructive font-bold mt-0.5">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Location Note */}
        <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex items-center gap-3 text-xs text-muted">
          <MapPin size={18} className="text-primary shrink-0" />
          <span>Coordinates: {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)} &bull; Downtown LA zone</span>
        </div>

        {/* Action Button */}
        {task.status === 'open' ? (
          <Link
            href={`/worker/task/${task.id}/claim`}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 text-center text-sm"
          >
            <Briefcase size={18} />
            Claim this task
          </Link>
        ) : (
          <div className="bg-slate-100 text-slate-500 font-bold py-4 px-6 rounded-2xl text-center border border-slate-200 mt-2 text-sm">
            This task has already been {task.status}.
          </div>
        )}
      </div>
    </div>
  );
}
