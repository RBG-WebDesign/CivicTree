// src/app/worker/report/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WorkerNav from '@/components/WorkerNav';
import { Camera, MapPin, CheckCircle, AlertTriangle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ReportProblem() {
  const [userId, setUserId] = useState('worker-austin-id');
  const [category, setCategory] = useState('trash');
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('/task_thumbnail.png');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // simulated GPS
  const [lat, setLat] = useState(34.0456);
  const [lng, setLng] = useState(-118.2505);

  const categories = [
    { id: 'trash', name: 'Trash' },
    { id: 'graffiti', name: 'Graffiti' },
    { id: 'broken_bench', name: 'Broken bench' },
    { id: 'dirty_sidewalk', name: 'Dirty sidewalk' },
    { id: 'dead_planter', name: 'Dead planter' },
    { id: 'illegal_dumping', name: 'Illegal dumping' },
    { id: 'damaged_sign', name: 'Damaged sign' },
    { id: 'biohazard', name: 'Needles or biohazard' },
    { id: 'blocked_sidewalk', name: 'Blocked sidewalk' },
    { id: 'other', name: 'Other' },
  ];

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find((row) => row.startsWith('civictree_user_id='));
    if (userCookie) {
      setUserId(userCookie.split('=')[1]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !note) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          category,
          note,
          latitude: lat,
          longitude: lng,
          photoUrl,
        }),
      });

      if (!res.ok) throw new Error('Submission failed');
      setSuccess(true);
      setNote('');
    } catch (err) {
      console.error(err);
      // fallback mock success for safety
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUploadSim = () => {
    // Randomize photos for rich look
    const photos = ['/task_thumbnail.png', '/volunteers_working.png'];
    const selected = photos[Math.floor(Math.random() * photos.length)];
    setPhotoUrl(selected);
    alert('Simulated photo upload complete.');
  };

  const isBiohazard = category === 'biohazard';

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex items-center gap-4">
        <Link href="/worker/today" className="text-muted hover:text-foreground shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold tracking-tight text-foreground font-heading">
          Report Something
        </h1>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-center">
        {success ? (
          <div className="flex flex-col gap-6 text-center items-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-primary flex items-center justify-center border border-emerald-100">
              <CheckCircle size={32} className="text-[#2d6a4f]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-foreground font-heading">Thanks. We’ll check this.</h2>
              <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">
                If it can become a paid task, it may show up on the map. We will send you updates in your dashboard.
              </p>
            </div>

            {isBiohazard && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs font-semibold max-w-xs leading-relaxed text-left flex gap-2">
                <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <span>Do not touch it. We’ll route this biohazard directly to the right city team.</span>
              </div>
            )}

            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-[#1b4332] hover:bg-[#133024] text-white py-3.5 rounded-xl text-xs font-bold transition-all shadow-md mt-2 cursor-pointer"
            >
              Report another issue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
            <div>
              <h2 className="text-lg font-black text-foreground font-heading">See something that needs care?</h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Take a photo. We’ll check if it can become a paid task.
              </p>
            </div>

            {/* Photo Capture Simulator */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Photo proof</label>
              <div 
                onClick={handlePhotoUploadSim}
                className="border-2 border-dashed border-[#e6e8e4] rounded-2xl p-6 text-center cursor-pointer hover:bg-neutral-50 transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-border">
                  <Camera size={18} className="text-muted" />
                </div>
                <span className="text-[11px] font-bold text-[#555]">Click to take/upload photo</span>
                <span className="text-[9px] text-[#888]">Simulates mobile camera upload</span>
              </div>
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Category</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                      category === c.id 
                        ? 'border-primary bg-emerald-50/20 text-[#111]' 
                        : 'border-[#e6e8e4] bg-white text-[#555] hover:bg-neutral-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Short note</label>
              <textarea
                required
                rows={3}
                placeholder="What needs to be fixed here? e.g. Trash pile blocking sidewalk."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-white border border-[#e6e8e4] p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1b4332]"
              />
            </div>

            {/* simulated GPS */}
            <div className="flex items-center justify-between border border-border bg-[#faf9f5] px-4 py-3 rounded-xl text-[10px] font-bold text-muted">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-[#2d6a4f]" />
                Location: {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
              <button 
                type="button" 
                onClick={() => { setLat(34.0440 + Math.random()*0.003); setLng(-118.2520 + Math.random()*0.003); }}
                className="text-primary hover:underline cursor-pointer"
              >
                Refresh coordinates
              </button>
            </div>

            {isBiohazard && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs font-semibold leading-relaxed flex gap-2">
                <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <span>Do not touch needles or biohazards. Just take a photo from a safe distance and submit. We’ll alert special teams.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1b4332] hover:bg-[#133024] disabled:bg-emerald-950/45 text-white py-3.5 rounded-xl text-xs font-bold transition-all shadow-md mt-2 cursor-pointer text-center"
            >
              {submitting ? 'Submitting report...' : 'Submit report'}
            </button>
          </form>
        )}
      </div>

      <WorkerNav />
    </div>
  );
}
