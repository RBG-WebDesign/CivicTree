// src/app/worker/task/[id]/active/page.tsx
'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, Camera, CheckCircle, ShieldAlert, Send, Sparkles,
  ClipboardCheck, ScanSearch, Clock,
} from 'lucide-react';

import { useDemoStore } from '@/lib/demo/store';
import { useHydrated } from '@/lib/demo/hooks';
import { ALLEY_AFTER_IMAGE, ALLEY_BEFORE_IMAGE } from '@/lib/demo/constants';
import type { Task, Claim } from '@/lib/demo/types';
import { useToast } from '@/components/demo/Toast';

export default function ActiveTask({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: taskId } = use(params);
  const { notify } = useToast();

  // --- Demo store ---
  const workerId = useDemoStore((s) => s.activePersona.userId);
  const tasks = useDemoStore((s) => s.tasks);
  const claims = useDemoStore((s) => s.claims);
  const checkInTask = useDemoStore((s) => s.checkInTask);
  const submitProof = useDemoStore((s) => s.submitProof);
  const hydrated = useHydrated();

  // --- Derived data ---
  const task: Task | undefined = tasks.find((t) => t.id === taskId);
  const claim: Claim | undefined = claims.find(
    (c) =>
      c.taskId === taskId &&
      c.workerId === workerId,
  );
  const isActiveClaim = claim?.status === 'claimed' || claim?.status === 'in_progress';
  const isSubmittedClaim = claim?.status === 'submitted';
  const isCompletedClaim = claim?.status === 'completed';

  // --- Flow state ---
  const [checkedIn, setCheckedIn] = useState(() => claim?.status === 'in_progress');
  const [checkingIn, setCheckingIn] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(
    () => claim?.gpsCheckin ?? null,
  );

  const [beforePhoto, setBeforePhoto] = useState<string>('');
  const [uploadingBefore, setUploadingBefore] = useState(false);

  const [afterPhoto, setAfterPhoto] = useState<string>('');
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkedRequirements, setCheckedRequirements] = useState<Record<string, boolean>>({});
  const taskChecklistItems = task?.doList?.length
    ? task.doList.slice(0, 4)
    : ['Site is clear', 'Work area is safe', 'Before and after photos match the same angle'];
  const allChecklistDone = taskChecklistItems.every((item) => checkedRequirements[item]);

  // --- Loading / error states ---
  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted mt-4">Loading active workspace...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border text-center">
        <ShieldAlert size={40} className="text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground">Workspace Error</h2>
        <p className="text-sm text-muted mt-2">
          This task could not be found. Return to today&apos;s task list and choose another nearby job.
        </p>
        <Link href="/worker/today" className="mt-6 bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-sm">
          Go to Today Tasks
        </Link>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border text-center">
        <ShieldAlert size={40} className="text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground">Workspace Error</h2>
        <p className="text-sm text-muted mt-2">
          You don&apos;t have a claim on this task yet. Claim it first before working.
        </p>
        <Link href="/worker/today" className="mt-6 bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-sm">
          Go to Today Tasks
        </Link>
      </div>
    );
  }

  if (!isActiveClaim) {
    return (
      <div className="flex-1 flex flex-col max-w-md mx-auto bg-[#faf9f5] min-h-screen border-x border-border shadow-sm">
        <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/worker/today" className="text-muted hover:text-foreground">
              <ArrowLeft size={20} />
            </Link>
            <span className="text-sm font-bold text-foreground font-heading">Task Status</span>
          </div>
          <span className="text-sm font-black text-primary font-heading">${task.payoutAmount.toFixed(2)}</span>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="bg-white border border-border rounded-3xl p-6 shadow-sm max-w-sm">
            <CheckCircle size={44} className="mx-auto text-success mb-4" />
            <h2 className="text-xl font-black text-foreground font-heading">
              {isSubmittedClaim ? 'Proof submitted' : isCompletedClaim ? 'Task completed' : 'Task no longer active'}
            </h2>
            <p className="text-sm text-muted mt-3 leading-relaxed">
              {isSubmittedClaim
                ? 'Your proof is already in review. The admin team will approve it before the payout becomes available.'
                : isCompletedClaim
                  ? 'This task has already been approved and paid into your available balance.'
                  : 'This task is not currently available for active work.'}
            </p>
            <div className="mt-5 rounded-2xl bg-[#faf9f5] border border-border p-4 text-left">
              <span className="text-[9px] uppercase tracking-wider font-bold text-primary">Task</span>
              <h3 className="mt-1 text-sm font-bold text-foreground font-heading">{task.title}</h3>
            </div>
            <Link href="/worker/today" className="mt-6 inline-flex bg-primary text-white font-bold py-3 px-6 rounded-xl text-sm">
              Back to Today
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Geolocation check-in ---
  const handleCheckIn = () => {
    setCheckingIn(true);
    const onSuccess = (lat: number, lng: number) => {
      setGpsCoords({ lat, lng });
      checkInTask(claim.id, { lat, lng });
      setCheckedIn(true);
      setCheckingIn(false);
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSuccess(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Mock coordinates on denial / timeout
          onSuccess(34.0456, -118.2505);
        },
        { timeout: 8000 },
      );
    } else {
      onSuccess(34.0456, -118.2505);
    }
  };

  // --- Photo uploads ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'before') setUploadingBefore(true);
    else setUploadingAfter(true);

    const previewUrl = URL.createObjectURL(file);
    if (type === 'before') {
      if (beforePhoto.startsWith('blob:')) URL.revokeObjectURL(beforePhoto);
      setBeforePhoto(previewUrl);
      setUploadingBefore(false);
    } else {
      if (afterPhoto.startsWith('blob:')) URL.revokeObjectURL(afterPhoto);
      setAfterPhoto(previewUrl);
      setUploadingAfter(false);
    }
  };

  // --- Use sample photos affordance ---
  const handleUseSamplePhotos = () => {
    setBeforePhoto(ALLEY_BEFORE_IMAGE);
    setAfterPhoto(ALLEY_AFTER_IMAGE);
  };

  // --- Submit proof ---
  const handleSubmit = () => {
    if (!task || !claim) {
      notify('Task or claim not found.', 'error');
      return;
    }
    if (!allChecklistDone) {
      notify('Confirm each task requirement before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    submitProof(claim.id, {
      beforePhoto: beforePhoto || ALLEY_BEFORE_IMAGE,
      afterPhoto: afterPhoto || ALLEY_AFTER_IMAGE,
      notes,
    });
    notify('Work submitted! Awaiting review.', 'success');
    router.push('/worker/today?submitted=success');
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-[#faf9f5] min-h-screen border-x border-border shadow-sm pb-12">
      {/* Top Header */}
      <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/worker/today" className="text-muted hover:text-foreground">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-sm font-bold text-foreground font-heading">Active Workspace</span>
        </div>
        <span className="text-sm font-black text-primary font-heading">${task.payoutAmount.toFixed(2)}</span>
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Task Title Header */}
        <div className="bg-white border border-border p-4 rounded-3xl shadow-sm flex flex-col gap-1.5">
          <span className="text-[9px] uppercase tracking-wider font-bold text-primary">Active task</span>
          <h2 className="text-base font-bold text-foreground font-heading leading-snug">{task.title}</h2>
        </div>

        <div className="bg-white border border-border p-4 rounded-3xl shadow-sm flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center shrink-0">
              <ScanSearch size={18} />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-primary">Proof stack</span>
              <h3 className="text-sm font-bold text-foreground font-heading mt-0.5">Live-style proof for civic work</h3>
              <p className="text-[11px] text-muted mt-1 leading-relaxed">
                Arrive, take a before photo, complete the checklist, take the same-angle after photo, then send it to admin review.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'GPS', active: checkedIn, step: 1 },
              { label: 'Before', active: Boolean(beforePhoto), step: 2 },
              { label: 'Checklist', active: allChecklistDone, step: 3 },
              { label: 'After', active: Boolean(afterPhoto), step: 4 },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-[#faf9f5] px-2 py-2">
                <div className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black ${item.active ? 'bg-primary text-white' : 'bg-slate-200 text-muted'}`}>{item.step}</div>
                <span className="text-[10px] font-bold text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Geolocation Check-in */}
        <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
              <h3 className="text-sm font-bold text-foreground font-heading">Location Check-in</h3>
            </div>
            {checkedIn && <CheckCircle size={18} className="text-success shrink-0" />}
          </div>

          {!checkedIn ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted leading-relaxed">
                Walk to the work area. Once you are at the location, tap the button to verify check-in.
              </p>
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                {checkingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying GPS...
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    Verify Check-in
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-[#e8f5e9] text-[#1b4332] text-xs p-3.5 rounded-xl border border-emerald-100/60 flex items-center gap-2">
              <MapPin size={16} className="text-success shrink-0" />
              <span>
                Location verified at{' '}
                {gpsCoords
                  ? `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}`
                  : 'Harlem Place Zone'}
                .
              </span>
            </div>
          )}
        </div>

        {/* Steps 2–4: visible after check-in */}
        {checkedIn && (
          <div className="flex flex-col gap-6">
            {/* Step 2: Before Photo */}
            <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="text-sm font-bold text-foreground font-heading">Before Photo</h3>
                </div>
                {beforePhoto && <CheckCircle size={18} className="text-success shrink-0" />}
              </div>

              {!beforePhoto ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-6 bg-slate-50 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'before')}
                      disabled={uploadingBefore}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadingBefore ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-muted">Reading before photo...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Camera size={26} className="text-muted" />
                        <span className="text-xs font-bold text-primary">Take before photo</span>
                        <span className="text-[10px] text-muted">Stand back, capture the full site, and keep this angle for the after photo</span>
                      </div>
                    )}
                  </div>

                  {/* Demo affordance: use sample photos */}
                  <button
                    onClick={handleUseSamplePhotos}
                    className="flex items-center justify-center gap-1.5 text-[11px] text-muted hover:text-primary transition-colors py-1"
                  >
                    <Sparkles size={11} />
                    Use sample photos for this demo
                  </button>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100">
                  <img src={beforePhoto} alt="Before work" className="w-full h-44 object-cover" />
                  <button
                    onClick={() => {
                      if (beforePhoto.startsWith('blob:')) URL.revokeObjectURL(beforePhoto);
                      setBeforePhoto('');
                    }}
                    className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full"
                  >
                    Retake Photo
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Complete the work */}
            {beforePhoto && (
              <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                    <h3 className="text-sm font-bold text-foreground font-heading">Complete the Work</h3>
                  </div>
                  {allChecklistDone && <CheckCircle size={18} className="text-success shrink-0" />}
                </div>

                <div className="bg-[#faf9f5] border border-border rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck size={15} className="text-primary" />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Task checklist</span>
                  </div>
                  {taskChecklistItems.map((item) => (
                    <label key={item} className="flex items-start gap-2 text-xs text-foreground font-semibold leading-relaxed">
                      <input
                        type="checkbox"
                        checked={Boolean(checkedRequirements[item])}
                        onChange={(e) => setCheckedRequirements((current) => ({
                          ...current,
                          [item]: e.target.checked,
                        }))}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                <p className="text-[11px] leading-relaxed text-muted">
                  Complete each item before taking the after photo. This gives admins a clean record of what the worker says was done.
                </p>
              </div>
            )}

            {/* Step 4: After Photo */}
            {beforePhoto && allChecklistDone && (
              <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">4</span>
                    <h3 className="text-sm font-bold text-foreground font-heading">After Photo</h3>
                  </div>
                  {afterPhoto && <CheckCircle size={18} className="text-success shrink-0" />}
                </div>

                {!afterPhoto ? (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-6 bg-slate-50 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'after')}
                      disabled={uploadingAfter}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadingAfter ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-muted">Reading after photo...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Camera size={26} className="text-muted" />
                        <span className="text-xs font-bold text-primary">Take after photo</span>
                        <span className="text-[10px] text-muted">Use the same angle so CivicTree can compare the before and after images</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100">
                    <img src={afterPhoto} alt="After work" className="w-full h-44 object-cover" />
                    <button
                      onClick={() => {
                        if (afterPhoto.startsWith('blob:')) URL.revokeObjectURL(afterPhoto);
                        setAfterPhoto('');
                      }}
                      className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full"
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Notes + Submit */}
            {afterPhoto && (
              <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">5</span>
                  <h3 className="text-sm font-bold text-foreground font-heading">Send to Admin Review</h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'GPS match', value: checkedIn ? 'OK' : 'Needed', icon: MapPin },
                    { label: 'Time proof', value: `${task.estimatedMinutes}m`, icon: Clock },
                    { label: 'AI score', value: allChecklistDone ? '96%' : 'Pending', icon: ScanSearch },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3">
                      <Icon size={13} className="text-primary" />
                      <div className="text-[10px] font-bold text-muted mt-2">{label}</div>
                      <div className="text-xs font-black text-primary font-heading mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="notes" className="text-[10px] font-bold text-muted uppercase tracking-wider">
                    Add notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Cleaned 2 bags of litter. Swept the walk."
                    className="border border-border p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-[#faf9f5]"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !allChecklistDone}
                  className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting task proof...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Submit task
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
