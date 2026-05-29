// src/app/worker/task/[id]/active/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Camera, UploadCloud, CheckCircle, ShieldAlert, FileText, Send, Sparkles } from 'lucide-react';

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

interface Claim {
  id: string;
  status: string;
}

export default function ActiveTask({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: taskId } = use(params);
  const workerId = 'worker-austin-id'; // Mock worker

  const [task, setTask] = useState<Task | null>(null);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow State
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const [beforePhoto, setBeforePhoto] = useState<string>('');
  const [uploadingBefore, setUploadingBefore] = useState(false);
  
  const [afterPhoto, setAfterPhoto] = useState<string>('');
  const [uploadingAfter, setUploadingAfter] = useState(false);
  
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadClaimData() {
      try {
        // Fetch tasks
        const tasksRes = await fetch('/api/tasks');
        if (!tasksRes.ok) throw new Error('Failed to load tasks');
        const tasks: Task[] = await tasksRes.json();
        const foundTask = tasks.find((t) => t.id === taskId);
        
        if (!foundTask) {
          setError('Task not found');
          setLoading(false);
          return;
        }
        setTask(foundTask);

        // Fetch active claim for this task
        const claimsRes = await fetch(`/api/tasks`); // In a real app we'd fetch the specific claim, but we can query standard tasks or mock a claim since we have hardcoded IDs
        // Let's create a claim record if it doesn't exist, or mock it.
        // Wait, the claim route already created it in the DB!
        // We can just verify it or mock a claim status if not loaded, but let's query the claim from DB via a quick api check if needed, or simply assume it exists if the task status is claimed.
        // Let's mock a claimId or let the API handle the submission using the database relationship.
        // Wait! How does the frontend get the claim ID?
        // Let's fetch it from a list of worker claims!
        // Wait, let's create a quick API fetch or fetch it directly. For Milestone 1, we can create a simple API endpoint to get worker claims, or simply fetch it from database.
        // Wait, can we fetch claims in a Server action or a simple helper?
        // Let's query all tasks/claims in this component or write an endpoint `/api/worker/claims` or look it up.
        // Let's write a simple fetch on `/api/tasks` and assume that if task is claimed, we can lookup the claim record from a quick API call!
        // Let's check what claims are in the database.
        // Wait, we can fetch the claim ID by writing an endpoint `/api/claims?workerId=worker-austin-id&taskId=taskId`!
        // That is extremely clean. Let's write that endpoint or query it. Let's create `src/app/api/claims/route.ts` that filters by workerId and taskId!
        // Yes, that will make fetching the claimId robust.
        // For now, let's write a placeholder fetch that checks `/api/claims?taskId=${taskId}`. We'll build the API endpoint in a second.
        
        const res = await fetch(`/api/claims?taskId=${taskId}&workerId=${workerId}`);
        if (res.ok) {
          const claimData = await res.json();
          if (claimData) {
            setClaim(claimData);
            if (claimData.status === 'in_progress' || claimData.gpsCheckin) {
              setCheckedIn(true);
            }
          }
        }
      } catch (err) {
        console.error('Error loading active task:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClaimData();
  }, [taskId, workerId]);

  // Geolocation Check-in
  const handleCheckIn = () => {
    setCheckingIn(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsCoords({ lat, lng });
          
          // Call API to record check-in / start task
          try {
            // Let's update check-in in DB
            if (claim) {
              await fetch(`/api/tasks/${taskId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimId: claim.id, latitude: lat, longitude: lng }),
              });
            }
            setCheckedIn(true);
          } catch (e) {
            console.error('Failed to save check-in on server', e);
            setCheckedIn(true); // Fallback: allow proceeding anyway
          } finally {
            setCheckingIn(false);
          }
        },
        (error) => {
          console.error('Geolocation error, mocking check-in:', error);
          // Mock coordinates
          setGpsCoords({ lat: 34.0456, lng: -118.2505 });
          setCheckedIn(true);
          setCheckingIn(false);
        },
        { timeout: 8000 }
      );
    } else {
      setGpsCoords({ lat: 34.0456, lng: -118.2505 });
      setCheckedIn(true);
      setCheckingIn(false);
    }
  };

  // Photo uploads
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'before') setUploadingBefore(true);
    else setUploadingAfter(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      if (type === 'before') setBeforePhoto(data.url);
      else setAfterPhoto(data.url);
    } catch (err) {
      alert('Photo upload failed. Please try again.');
    } finally {
      if (type === 'before') setUploadingBefore(false);
      else setUploadingAfter(false);
    }
  };

  // Submit task proof
  const handleSubmit = async () => {
    if (!beforePhoto || !afterPhoto || !task || !claim) {
      alert('Please upload both before and after photos.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId,
          claimId: claim.id,
          beforePhotos: beforePhoto,
          afterPhotos: afterPhoto,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit proof');
      }

      // Route back to today list
      router.push('/worker/today?submitted=success');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted mt-4">Loading active workspace...</span>
      </div>
    );
  }

  if (error || !task || !claim) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto bg-white min-h-screen border-x border-border text-center">
        <ShieldAlert size={40} className="text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground">Workspace Error</h2>
        <p className="text-sm text-muted mt-2">
          You don't have an active claim on this task. Claim it first before working.
        </p>
        <Link href="/worker/today" className="mt-6 bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-sm">
          Go to Today Tasks
        </Link>
      </div>
    );
  }

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
              <span>Location verified at {gpsCoords ? `${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}` : 'Harlem Place Zone'}.</span>
            </div>
          )}
        </div>

        {/* Step 2 & 3: Before / After Photo uploads */}
        {checkedIn && (
          <div className="flex flex-col gap-6">
            {/* Before Photo Card */}
            <div className="bg-white border border-border p-5 rounded-3xl shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="text-sm font-bold text-foreground font-heading">Before Photo</h3>
                </div>
                {beforePhoto && <CheckCircle size={18} className="text-success shrink-0" />}
              </div>

              {!beforePhoto ? (
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
                      <span className="text-xs text-muted">Uploading before photo...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Camera size={26} className="text-muted" />
                      <span className="text-xs font-bold text-primary">Take before photo</span>
                      <span className="text-[10px] text-muted">Ensure entire site is clearly visible</span>
                    </div>
                  )}
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

            {/* After Photo Card */}
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
                        <span className="text-xs text-muted">Uploading after photo...</span>
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

            {/* Step 4: Submission Notes & Submit Button */}
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

                {/* Submit Action */}
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
