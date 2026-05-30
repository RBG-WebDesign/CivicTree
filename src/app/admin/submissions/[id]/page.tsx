'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, XCircle, ShieldAlert, FileText, Calendar, User,
  Info, MapPin, Clock, BadgeAlert, ClipboardCheck,
} from 'lucide-react';
import { useDemoStore } from '@/lib/demo/store';
import { useHydrated } from '@/lib/demo/hooks';
import { useToast } from '@/components/demo/Toast';

export default function SubmissionReviewDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: submissionId } = use(params);
  const router = useRouter();
  const { notify } = useToast();

  const submissions = useDemoStore((s) => s.submissions);
  const tasks = useDemoStore((s) => s.tasks);
  const workers = useDemoStore((s) => s.workers);
  const reviewSubmission = useDemoStore((s) => s.reviewSubmission);
  const hydrated = useHydrated();

  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted mt-4">Loading submission data...</span>
      </div>
    );
  }

  const submission = submissions.find((s) => s.id === submissionId);
  const task = submission ? tasks.find((t) => t.id === submission.taskId) : undefined;
  const worker = submission ? workers.find((w) => w.id === submission.workerId) : undefined;

  if (!submission || !task || !worker) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen bg-slate-50 text-center">
        <ShieldAlert size={40} className="text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground">Submission Not Found</h2>
        <p className="text-sm text-muted mt-2">This submission could not be found in the demo store.</p>
        <Link
          href="/admin/submissions"
          className="mt-6 inline-flex items-center gap-1 text-primary font-bold text-sm"
        >
          <ArrowLeft size={16} />
          Go back to Queue
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    if (processing) return;
    setProcessing(true);
    reviewSubmission(submission.id, 'approve', { approvedAmount: task.payoutAmount });
    notify('Approved. Payment released to the worker.', 'success');
    router.push('/admin/submissions');
  };

  const handleReject = () => {
    if (processing) return;
    if (!reason.trim()) {
      notify('Add a reason for rejection.', 'error');
      return;
    }
    setProcessing(true);
    reviewSubmission(submission.id, 'reject', { reason: reason.trim() });
    notify('Submission rejected.', 'info');
    router.push('/admin/submissions');
  };

  const submittedDate = new Date(submission.submittedAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const alreadyReviewed = submission.status !== 'submitted';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-[38px] z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/submissions" className="text-muted hover:text-foreground">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-sm font-bold text-foreground font-heading">Submission Review Workspace</span>
        </div>
        <span className="text-xs text-muted">ID: {submission.id.substring(0, 8)}</span>
      </div>

      <div className="p-6 md:p-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 max-w-6xl mx-auto w-full">
        {/* Left column: Photo Review (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Photo comparison */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
              Photo Evidence Comparison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-muted-foreground bg-slate-100 px-3 py-1 rounded-lg w-max uppercase tracking-wider">
                  Before Work
                </span>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={submission.beforePhoto}
                    alt="Before Work Proof"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* After Photo */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg w-max uppercase tracking-wider">
                  After Work
                </span>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={submission.afterPhoto}
                    alt="After Work Proof"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* GPS Check & Time-on-site logs */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted font-heading flex items-center gap-1">
                <MapPin size={14} className="text-primary" />
                GPS Verification
              </span>
              <div className="bg-[#faf9f5] border border-border p-4 rounded-xl text-xs font-semibold flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between">
                  <span>Task coordinates:</span>
                  <span className="text-foreground">{task.location.lat.toFixed(4)}, {task.location.lng.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker check-in:</span>
                  <span className="text-foreground">{task.location.lat.toFixed(4)}, {task.location.lng.toFixed(4)}</span>
                </div>
                <div className="border-t border-dashed border-border/80 my-1 pt-1.5 flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100">MATCH (OK)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted font-heading flex items-center gap-1">
                <Clock size={14} className="text-primary" />
                Time on Site Log
              </span>
              <div className="bg-[#faf9f5] border border-border p-4 rounded-xl text-xs font-semibold flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between">
                  <span>Task submitted:</span>
                  <span className="text-foreground">
                    {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated time:</span>
                  <span className="text-foreground">{task.estimatedMinutes} minutes</span>
                </div>
                <div className="border-t border-dashed border-border/80 my-1 pt-1.5 flex justify-between">
                  <span>Duration:</span>
                  <span className="text-foreground font-bold">{task.estimatedMinutes} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Review Verdict Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-heading">
              Review Verdict
            </h3>

            {/* Submission Info */}
            <div className="flex flex-col gap-3 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-muted flex items-center gap-1">
                  <User size={12} /> Worker profile
                </span>
                <Link
                  href={`/admin/workers/${submission.workerId}`}
                  className="font-bold text-primary hover:underline"
                >
                  {worker.name} (Lvl {worker.level})
                </Link>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted flex items-center gap-1">
                  <Calendar size={12} /> Submitted
                </span>
                <span className="text-foreground font-medium">{submittedDate}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
                <span className="text-sm font-bold text-foreground font-heading">Payout Amount</span>
                <span className="text-lg font-black text-primary font-heading">${task.payoutAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* AI Notes, Safety & Fraud flags */}
            <div className="flex flex-col gap-3 text-xs border-b border-slate-100 pb-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-primary shrink-0" />
                  <div>
                    <span className="block font-bold text-foreground">Layered proof score</span>
                    <span className="text-[10px] text-muted">Photo, GPS, time, checklist, AI, admin</span>
                  </div>
                </div>
                <span className="text-lg font-black text-primary font-heading">96%</span>
              </div>

              <div className="flex items-start gap-2">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground">AI Verification</span>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Before and after photos appear to match the same angle. Sidewalk litter is reduced and cleanup materials are detected near the task coordinates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-50">
                <ShieldAlert size={14} className="text-[#2d6a4f] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground">Safety Flags</span>
                  <p className="text-[10px] text-muted">No safety violations reported by worker.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2 border-t border-slate-50">
                <BadgeAlert size={14} className="text-emerald-800 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground">Fraud Verification</span>
                  <p className="text-[10px] text-muted">GPS bounds, timestamp, checklist completion, and repeated-photo risk checked.</p>
                </div>
              </div>
            </div>

            {/* Worker Notes */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                <FileText size={10} /> Worker Notes
              </span>
              <p className="text-xs text-muted-foreground bg-[#faf9f5] border border-border/60 p-3 rounded-xl italic leading-relaxed">
                {submission.notes ? `"${submission.notes}"` : 'No comments provided by worker.'}
              </p>
            </div>

            {/* Review checklist */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2 text-[10px] text-muted leading-relaxed font-bold">
              <span>Review checklist:</span>
              <div className="flex gap-1.5 items-start">
                <span className="text-[#2d6a4f]">&bull;</span>
                <span>Does the after photo show the requested work?</span>
              </div>
              <div className="flex gap-1.5 items-start">
                <span className="text-[#2d6a4f]">&bull;</span>
                <span>Do the before and after photos use a comparable angle?</span>
              </div>
              <div className="flex gap-1.5 items-start">
                <span className="text-[#2d6a4f]">&bull;</span>
                <span>Was the worker in the right place?</span>
              </div>
              <div className="flex gap-1.5 items-start">
                <span className="text-[#2d6a4f]">&bull;</span>
                <span>Should this task be paid?</span>
              </div>
            </div>

            {/* Decision area */}
            {alreadyReviewed ? (
              <div className={`rounded-xl p-4 flex flex-col gap-2 text-xs border ${
                submission.status === 'approved'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {submission.status === 'approved' ? (
                    <CheckCircle2 size={16} className="text-emerald-700" />
                  ) : (
                    <XCircle size={16} className="text-red-700" />
                  )}
                  {submission.status === 'approved' ? 'Approved' : 'Rejected'}
                </div>
                {submission.reviewReason && (
                  <p className="text-[11px] leading-relaxed opacity-80">{submission.reviewReason}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reason" className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Review Feedback / Reason
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide feedback to the worker..."
                    className="border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="border border-red-200 hover:bg-red-50 text-destructive font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
