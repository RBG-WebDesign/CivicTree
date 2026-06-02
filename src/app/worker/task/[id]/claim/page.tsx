// src/app/worker/task/[id]/claim/page.tsx
'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle,
  CircleDollarSign,
  ClipboardCheck,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { useHydrated } from '@/lib/demo/hooks';
import { useToast } from '@/components/demo/Toast';
import type { Claim, Task } from '@/lib/demo/types';

export default function ClaimTaskChecklist({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: taskId } = use(params);
  const { notify } = useToast();

  const tasks = useDemoStore((s) => s.tasks);
  const claims = useDemoStore((s) => s.claims);
  const claimTask = useDemoStore((s) => s.claimTask);
  const workerId = useDemoStore((s) => s.activePersona.userId);
  const hydrated = useHydrated();
  const isDesktopHandoff = searchParams.get('handoff') === 'desktop';

  // Checklist states
  const [checkedGloves, setCheckedGloves] = useState(false);
  const [checkedBags, setCheckedBags] = useState(false);
  const [checkedShoes, setCheckedShoes] = useState(false);
  const [checkedBattery, setCheckedBattery] = useState(false);
  const [checkedSafety, setCheckedSafety] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [desktopClaimed, setDesktopClaimed] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-muted mt-4">Loading safety checks...</span>
      </div>
    );
  }

  const task = tasks.find((t) => t.id === taskId);
  const existingClaim = claims.find((claim) => claim.taskId === taskId && claim.workerId === workerId);

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
    if (isDesktopHandoff && existingClaim) {
      return <DesktopClaimed task={task} claim={existingClaim} notify={notify} />;
    }

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

  if (isDesktopHandoff) {
    if (desktopClaimed || existingClaim) {
      return <DesktopClaimed task={task} claim={existingClaim ?? null} notify={notify} />;
    }

    return (
      <DesktopClaimConfirmation
        task={task}
        claiming={claiming}
        onConfirm={() => {
          if (claiming) return;
          setClaiming(true);
          claimTask(taskId, workerId);
          setDesktopClaimed(true);
          notify('Task claimed. Continue on mobile when you are near the location.', 'success');
        }}
        notify={notify}
      />
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

function DesktopClaimConfirmation({
  claiming,
  notify,
  onConfirm,
  task,
}: {
  claiming: boolean;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  onConfirm: () => void;
  task: Task;
}) {
  return (
    <DesktopShell>
      <div className="grid min-h-[calc(100vh-120px)] gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <Link href="/worker/map" className="mb-8 inline-flex items-center gap-2 text-sm font-black text-[#667067] hover:text-[#101814]">
            <ArrowLeft size={17} />
            Back to map
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#197243]">Claim confirmation</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight text-[#101814]">
            Confirm this task before it is reserved for you.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#526057]">
            Desktop is for deciding and claiming. The actual work, GPS check-in, photos, notes, and submission happen on mobile when you are near the task location.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#e2e5de] bg-white p-6 shadow-[0_24px_80px_rgba(16,24,20,0.1)]">
          <div className="flex flex-col justify-between gap-5 border-b border-[#edf0e9] pb-6 sm:flex-row sm:items-start">
            <div>
              <span className="rounded-full bg-[#e4f3df] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#197243]">
                Ready to claim
              </span>
              <h2 className="mt-4 text-3xl font-black text-[#101814]">{task.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#667067]">{task.description}</p>
            </div>
            <div className="shrink-0 rounded-2xl bg-[#f7f8f4] px-5 py-4 text-right">
              <div className="text-4xl font-black text-[#197243]">${task.payoutAmount.toFixed(0)}</div>
              <div className="mt-1 text-xs font-black uppercase tracking-wide text-[#667067]">Reward</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DesktopNotice icon={CalendarClock} title="Deadline" copy="Start this task today. Release it if you cannot make it." />
            <DesktopNotice icon={MapPin} title="GPS required" copy="You must be near the location before work can begin." />
            <DesktopNotice icon={ClipboardCheck} title="Photos required" copy="Before and after photos are required for payment review." />
            <DesktopNotice icon={CircleDollarSign} title="Payment review" copy="Rewards are released after an admin approves your proof." />
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <div className="flex gap-3">
              <ShieldAlert size={22} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <h3 className="text-sm font-black">Important notice</h3>
                <p className="mt-2 text-sm leading-6">
                  You must be near the location to begin. Photos are required for payment. Rewards are released after review.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
            <Link href="/worker/map" className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#e1e4dc] text-sm font-black text-[#101814] hover:bg-[#f7f8f4]">
              Not now
            </Link>
            <button
              type="button"
              onClick={onConfirm}
              disabled={claiming}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#197243] text-sm font-black text-white shadow-[0_16px_34px_rgba(25,114,67,0.22)] transition hover:bg-[#135f38] disabled:bg-[#197243]/55"
            >
              {claiming ? 'Claiming task...' : 'Confirm claim'}
              <ArrowRight size={18} />
            </button>
          </div>

          {claiming && (
            <div className="mt-6">
              <DesktopClaimed task={task} claim={null} notify={notify} embedded />
            </div>
          )}
        </div>
      </div>
    </DesktopShell>
  );
}

function DesktopClaimed({
  claim,
  embedded = false,
  notify,
  task,
}: {
  claim: Claim | null;
  embedded?: boolean;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  task: Task;
}) {
  const content = (
    <div className="rounded-[2rem] border border-[#cfe7d3] bg-white p-6 shadow-[0_24px_80px_rgba(16,24,20,0.1)]">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e4f3df] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#197243]">
            <CheckCircle size={15} />
            Task claimed
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#101814]">{task.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667067]">
            This task is reserved for you. Continue on mobile when you are near the location, then complete GPS check-in, proof photos, and submission from the mobile app.
          </p>
        </div>
        <div className="rounded-2xl bg-[#f7f8f4] px-5 py-4 text-right">
          <div className="text-4xl font-black text-[#197243]">${task.payoutAmount.toFixed(0)}</div>
          <div className="mt-1 text-xs font-black uppercase tracking-wide text-[#667067]">Reward</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatusTile label="Current status" value="Claimed" />
        <StatusTile label="Deadline" value="Today" />
        <StatusTile label="Estimated time" value={`${task.estimatedMinutes} min`} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href={`/worker/task/${task.id}/active`}
          className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#197243] text-sm font-black text-white shadow-[0_16px_34px_rgba(25,114,67,0.22)]"
        >
          <Phone size={18} />
          Continue on mobile
        </Link>
        <button
          type="button"
          onClick={() => notify('Mobile link copied for this demo.', 'info')}
          className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-[#e1e4dc] bg-white text-sm font-black text-[#101814] hover:bg-[#f7f8f4]"
        >
          <MessageSquare size={18} />
          Send link to phone
        </button>
        <Link
          href={`/worker/task/${task.id}`}
          className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-[#e1e4dc] bg-white text-sm font-black text-[#101814] hover:bg-[#f7f8f4]"
        >
          <ExternalLink size={18} />
          View instructions
        </Link>
      </div>

      {claim?.claimedAt && (
        <p className="mt-4 text-xs font-semibold text-[#667067]">
          Claimed at {new Date(claim.claimedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <DesktopShell>
      <div className="flex min-h-[calc(100vh-120px)] items-center">
        <div className="w-full">{content}</div>
      </div>
    </DesktopShell>
  );
}

function DesktopNotice({
  copy,
  icon: Icon,
  title,
}: {
  copy: string;
  icon: typeof CalendarClock;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-[#edf0e9] bg-[#fcfcfa] p-4">
      <Icon size={20} className="text-[#197243]" />
      <h3 className="mt-3 text-sm font-black text-[#101814]">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-[#667067]">{copy}</p>
    </div>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#edf0e9] bg-[#fcfcfa] p-5">
      <div className="text-xs font-black uppercase tracking-wide text-[#667067]">{label}</div>
      <div className="mt-2 text-xl font-black text-[#101814]">{value}</div>
    </div>
  );
}

function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fbfbf8] px-6 py-8 text-[#101814] md:px-10">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
