// src/app/worker/task/[id]/active/page.tsx
'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Camera, CheckCircle, ShieldAlert, Send, Sparkles } from 'lucide-react';

import { useDemoStore } from '@/lib/demo/store';
import { useHydrated } from '@/lib/demo/hooks';
import { PLACEHOLDER_PROOF_IMAGE } from '@/lib/demo/constants';
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
      c.workerId === workerId &&
      (c.status === 'claimed' || c.status === 'in_progress'),
  );

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

  // --- Loading / error states ---
  if (!hydrated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted mt-4">Loading active workspace...</span>
      </div>
    );
  }

  if (!task || !claim) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border text-center">
        <ShieldAlert size={40} className="text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground">Workspace Error</h2>
        <p className="text-sm text-muted mt-2">
          You don&apos;t have an active claim on this task. Claim it first before working.
        </p>
        <Link href="/worker/today" className="mt-6 bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-sm">
          Go to Today Tasks
        </Link>
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

  // --- Photo uploads (base64 via FileReader) ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'before') setUploadingBefore(true);
    else setUploadingAfter(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (type === 'before') {
        setBeforePhoto(dataUrl);
        setUploadingBefore(false);
      } else {
        setAfterPhoto(dataUrl);
        setUploadingAfter(false);
      }
    };
    reader.onerror = () => {
      notify('Photo read failed. Please try again.', 'error');
      if (type === 'before') setUploadingBefore(false);
      else setUploadingAfter(false);
    };
    reader.readAsDataURL(file);
  };

  // --- Use sample photos affordance ---
  const handleUseSamplePhotos = () => {
    setBeforePhoto(PLACEHOLDER_PROOF_IMAGE);
    setAfterPhoto(PLACEHOLDER_PROOF_IMAGE);
  };

  // --- Submit proof ---
  const handleSubmit = () => {
    if (!task || !claim) {
      notify('Task or claim not found.', 'error');
      return;
    }

    setSubmitting(true);
    submitProof(claim.id, {
      beforePhoto: beforePhoto || PLACEHOLDER_PROOF_IMAGE,
      afterPhoto: afterPhoto || PLACEHOLDER_PROOF_IMAGE,
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
                        <span className="text-[10px] text-muted">Ensure entire site is clearly visible</span>
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
                    onClick={() => setBeforePhoto('')}
                    className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full"
                  >
                    Retake Photo
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: After Photo */}
            {beforePhoto && (
              <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
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
                        <span className="text-[10px] text-muted">Take from the same angle as the before photo</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-100">
                    <img src={afterPhoto} alt="After work" className="w-full h-44 object-cover" />
                    <button
                      onClick={() => setAfterPhoto('')}
                      className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full"
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Notes + Submit */}
            {afterPhoto && (
              <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">4</span>
                  <h3 className="text-sm font-bold text-foreground font-heading">Submit Work</h3>
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
                  disabled={submitting}
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
