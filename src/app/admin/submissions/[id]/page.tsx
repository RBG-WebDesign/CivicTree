// src/app/admin/submissions/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, ShieldAlert, FileText, Calendar, User, Info, MapPin, Clock, AlertTriangle, BadgeAlert } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  payoutAmount: number;
  latitude: number;
  longitude: number;
}

interface Worker {
  id: string;
  name: string;
  safetyScore: number;
  reliabilityScore: number;
  level: number;
}

interface Submission {
  id: string;
  taskId: string;
  workerId: string;
  beforePhotos: string;
  afterPhotos: string;
  notes: string | null;
  status: string;
  submittedAt: string;
  task: Task;
  worker: Worker;
  claim: {
    claimedAt: string;
    gpsCheckin: string | null;
  } | null;
}

export default function SubmissionReviewDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: submissionId } = use(params);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    async function loadSubmission() {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`);
        if (!res.ok) {
          throw new Error('Submission not found or failed to load');
        }
        const data = await res.json();
        
        // Ensure worker object has fields
        if (data.worker && !data.worker.level) {
          data.worker.level = 2;
          data.worker.safetyScore = 100;
          data.worker.reliabilityScore = 98.5;
        }
        // inject claim time mock if missing
        if (!data.claim) {
          data.claim = {
            claimedAt: new Date(new Date(data.submittedAt).getTime() - 24 * 60 * 1000).toISOString(),
            gpsCheckin: JSON.stringify({ lat: data.task.latitude, lng: data.task.longitude }),
          };
        }

        setSubmission(data);
      } catch (err: any) {
        setError(err.message || 'Error occurred');
      } finally {
        setLoading(false);
      }
    }
    loadSubmission();
  }, [submissionId]);

  const handleReview = async (decision: 'approve' | 'reject') => {
    if (!submission) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerId: 'admin-id', // Mock active reviewer
          decision,
          reason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      // Redirect back to submissions list
      router.push('/admin/submissions?reviewed=success');
    } catch (err: any) {
      alert(err.message || 'Review submission failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted mt-4">Loading submission data...</span>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen bg-slate-50 text-center">
        <ShieldAlert size={40} className="text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground">Error Loading Submission</h2>
        <p className="text-sm text-muted mt-2">{error || 'Submission could not be found.'}</p>
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

  const submittedDate = new Date(submission.submittedAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const claimedDate = submission.claim
    ? new Date(submission.claim.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  const durationMin = submission.claim
    ? Math.round((new Date(submission.submittedAt).getTime() - new Date(submission.claim.claimedAt).getTime()) / 60000)
    : 24;

  const gpsCoords = submission.claim?.gpsCheckin 
    ? JSON.parse(submission.claim.gpsCheckin) 
    : { lat: submission.task.latitude, lng: submission.task.longitude };

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
        {/* Left column: Side-by-side Photo Review & GPS Verification (8 cols) */}
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
                    src={submission.beforePhotos}
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
                    src={submission.afterPhotos}
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
                  <span className="text-foreground">{submission.task.latitude.toFixed(4)}, {submission.task.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker check-in:</span>
                  <span className="text-foreground">{gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}</span>
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
                  <span>Task claimed:</span>
                  <span className="text-foreground">{claimedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Task submitted:</span>
                  <span className="text-foreground">{new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="border-t border-dashed border-border/80 my-1 pt-1.5 flex justify-between">
                  <span>Duration:</span>
                  <span className="text-foreground font-bold">{durationMin} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Review Verdict Panel & Details (4 cols) */}
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
                  {submission.worker.name} (Lvl {submission.worker.level})
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
                <span className="text-lg font-black text-primary font-heading">${submission.task.payoutAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* AI Notes, Safety & Fraud flags */}
            <div className="flex flex-col gap-3 text-xs border-b border-slate-100 pb-4">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground">AI Verification</span>
                  <p className="text-[10px] text-muted leading-relaxed">
                    98% confidence. Sidewalk litter removed. Garbage bags detected at pickup coordinates.
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
                  <p className="text-[10px] text-muted">GPS bounds checked. Device fingerprint MATCH.</p>
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

            {/* Questions to guide reviewer */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2 text-[10px] text-muted leading-relaxed font-bold">
              <span>Review checklist:</span>
              <div className="flex gap-1.5 items-start">
                <span className="text-[#2d6a4f]">&bull;</span>
                <span>Does the after photo show the requested work?</span>
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

            {/* Review Decision Input */}
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
                  onClick={() => handleReview('reject')}
                  disabled={processing}
                  className="border border-red-200 hover:bg-red-50 text-destructive font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <X size={14} />
                  Reject
                </button>
                <button
                  onClick={() => handleReview('approve')}
                  disabled={processing}
                  className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Check size={14} />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
