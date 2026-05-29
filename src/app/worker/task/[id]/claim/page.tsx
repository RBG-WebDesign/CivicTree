// src/app/worker/task/[id]/claim/page.tsx
'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, ShieldAlert, ArrowLeft, Landmark, XCircle } from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { useHydrated } from '@/lib/demo/hooks';
import { useToast } from '@/components/demo/Toast';

export default function ClaimTaskChecklist({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: taskId } = use(params);
  const { notify } = useToast();

  const tasks = useDemoStore((s) => s.tasks);
  const claimTask = useDemoStore((s) => s.claimTask);
  const workerId = useDemoStore((s) => s.activePersona.userId);
  const hydrated = useHydrated();

  // Checklist states
  const [checkedGloves, setCheckedGloves] = useState(false);
  const [checkedBags, setCheckedBags] = useState(false);
  const [checkedShoes, setCheckedShoes] = useState(false);
  const [checkedBattery, setCheckedBattery] = useState(false);
  const [checkedSafety, setCheckedSafety] = useState(false);
  const [claiming, setClaiming] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-muted mt-4">Loading safety checks...</span>
      </div>
    );
  }

  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border text-center">
        <XCircle size={40} className="text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Task not found</h2>
        <Link href="/worker/map" className="mt-4 text-xs font-bold text-primary inline-flex items-center gap-1">
          <ArrowLeft size={14} />
          Back to map
        </Link>
      </div>
    );
  }

  if (task.status !== 'open') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border text-center">
        <XCircle size={40} className="text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Task no longer available</h2>
        <p className="text-xs text-muted mt-2">This task is no longer available for claiming.</p>
        <Link href="/worker/map" className="mt-4 text-xs font-bold text-primary inline-flex items-center gap-1">
          <ArrowLeft size={14} />
          Back to map
        </Link>
      </div>
    );
  }

  const allChecked = checkedGloves && checkedBags && checkedShoes && checkedBattery && checkedSafety;

  const handleClaim = () => {
    if (!allChecked || claiming) return;
    setClaiming(true);
    claimTask(taskId, workerId);
    notify('Task claimed. Head to the work area.', 'success');
    router.push(`/worker/task/${taskId}/active`);
  };

  const toolsDisplay = task.requiredTools.filter((t) => t.toLowerCase() !== 'none').join(', ');

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-[#faf9f5] min-h-screen border-x border-border shadow-sm pb-8">
      {/* Header */}
      <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex items-center gap-4">
        <Link href={`/worker/task/${task.id}`} className="text-muted hover:text-foreground shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold tracking-tight text-foreground font-heading">Before you go</h1>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Intro */}
        <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Claim Checklist</span>
          <h2 className="text-base font-bold text-foreground font-heading">{task.title}</h2>
          <p className="text-xs text-muted leading-relaxed">
            Please verify you have the necessary safety equipment and supplies ready before checking in at the site.
          </p>
        </div>

        {/* Supplies Alert if needed */}
        {toolsDisplay && (
          <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-3">
            <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Supplies needed</span>
            <div className="bg-orange-50 border border-orange-200 text-orange-950 p-4 rounded-xl text-xs font-bold flex flex-col gap-1">
              <span>Pick up your kit first.</span>
              <p className="text-[11px] font-semibold text-orange-900 leading-normal mt-0.5">
                This task requires tools: {toolsDisplay}.
              </p>
            </div>

            {/* Depot Card */}
            <div className="border border-border p-4 rounded-2xl bg-[#faf9f5] flex justify-between items-center text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-foreground">Spring Street Depot</span>
                <span className="text-[10px] text-muted">0.3 miles away &bull; Open until 5 PM</span>
              </div>
              <button
                type="button"
                onClick={() => notify('Routing to Spring Street Depot...', 'info')}
                className="text-primary hover:underline font-bold text-[11px]"
              >
                Route me
              </button>
            </div>
          </div>
        )}

        {/* Checklist Form */}
        <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
            Safety Checklist
          </h3>

          <div className="flex flex-col gap-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedGloves}
                onChange={(e) => setCheckedGloves(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-[#555] font-semibold">I have heavy-duty gloves ready</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedBags}
                onChange={(e) => setCheckedBags(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-[#555] font-semibold">I have cleanup trash bags ready</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedShoes}
                onChange={(e) => setCheckedShoes(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-[#555] font-semibold">I am wearing closed-toe shoes</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedBattery}
                onChange={(e) => setCheckedBattery(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-[#555] font-semibold">My phone battery is above 30%</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedSafety}
                onChange={(e) => setCheckedSafety(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-xs text-[#555] font-semibold">I know what not to touch (needles, waste)</span>
            </label>
          </div>
        </div>

        {/* Claim Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleClaim}
            disabled={!allChecked || claiming}
            className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center text-sm"
          >
            {claiming ? 'Checking in...' : "I'm ready"}
          </button>

          <Link
            href={`/worker/task/${task.id}`}
            className="text-xs font-bold text-center text-muted hover:text-foreground transition-all py-2"
          >
            Not doing this task
          </Link>
        </div>
      </div>
    </div>
  );
}
