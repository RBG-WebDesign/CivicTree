// src/app/worker/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Compass, ShieldAlert, MapPin, DollarSign, User as UserIcon, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('worker-new-id');
  
  // Profile Form State
  const [name, setName] = useState('Maya');
  const [phone, setPhone] = useState('213-555-0122');
  const [neighborhood, setNeighborhood] = useState('Downtown LA');
  const [language, setLanguage] = useState('en');
  
  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);
  
  // Setup loading state
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find((row) => row.startsWith('civictree_user_id='));
    if (userCookie) {
      setUserId(userCookie.split('=')[1]);
    }
  }, []);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    if (quizAnswer === 'report') {
      setQuizError(false);
      // Automatically advance to final screen after a small delay
      setTimeout(() => {
        setStep(8);
      }, 1000);
    } else {
      setQuizError(true);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          neighborhood,
          language,
          onboardingCompleted: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to update onboarding state');
      
      // Update cookies just in case role needs refresh
      document.cookie = `civictree_role=worker; path=/`;
      document.cookie = `civictree_user_id=${userId}; path=/`;

      router.push('/worker/today');
    } catch (error) {
      console.error(error);
      // Fallback redirect even if database update fails for local mock
      router.push('/worker/today');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm justify-between pb-8">
      {/* Top Header */}
      <div className="bg-white border-b border-border py-4 px-6 flex items-center justify-between sticky top-[38px] z-10">
        <span className="text-xs font-bold tracking-tight text-foreground font-heading">
          Worker Onboarding
        </span>
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
          Step {step} of 8
        </span>
      </div>

      {/* Main Container */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className="flex flex-col gap-6 text-center items-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#1b4332] flex items-center justify-center border border-emerald-100">
              <Leaf size={32} className="text-[#2d6a4f]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-foreground font-heading">Welcome to CivicTree.</h2>
              <p className="text-sm text-muted leading-relaxed">
                Earn money by helping fix your neighborhood.
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-[#1b4332] hover:bg-[#133024] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-md mt-4 cursor-pointer"
            >
              Get started
            </button>
          </div>
        )}

        {/* Screen 2: What you can do */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center border border-emerald-100 mb-2">
                <Compass size={24} className="text-[#2d6a4f]" />
              </div>
              <h2 className="text-xl font-bold text-foreground font-heading">What you can do</h2>
              <p className="text-xs text-muted leading-relaxed max-w-xs">
                Start with simple tasks. Pick up litter. Water planters. Report problems. Join team cleanups later.
              </p>
            </div>

            <div className="bg-[#faf9f5] border border-border p-5 rounded-2xl flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center text-xs font-black text-primary shrink-0">1</span>
                <span className="text-xs text-[#555] font-bold">Pick up litter and debris</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center text-xs font-black text-primary shrink-0">2</span>
                <span className="text-xs text-[#555] font-bold">Water dry sidewalk planters</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white border border-border flex items-center justify-center text-xs font-black text-primary shrink-0">3</span>
                <span className="text-xs text-[#555] font-bold">Photograph neighborhood problems</span>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-[#1b4332] hover:bg-[#133024] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-md mt-4 cursor-pointer"
            >
              Continue
            </button>
          </div>
        )}

        {/* Screen 3: Safety Basics */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 mb-2">
                <ShieldAlert size={24} />
              </div>
              <h2 className="text-xl font-bold text-foreground font-heading">Safety basics</h2>
              <p className="text-xs text-muted leading-relaxed max-w-xs">
                Some things are not safe. Do not touch needles, human waste, chemicals, weapons, or anything that feels dangerous. Report it instead.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 p-5 rounded-2xl flex flex-col gap-3 text-amber-900 text-xs">
              <span className="font-bold text-amber-950">Safety rules checklist:</span>
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-1 h-1 rounded-full bg-amber-700 shrink-0" />
                Never touch medical waste or needles.
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-1 h-1 rounded-full bg-amber-700 shrink-0" />
                Stay on sidewalks and out of street traffic.
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-1 h-1 rounded-full bg-amber-700 shrink-0" />
                Do not enter gated private property.
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-[#1b4332] hover:bg-[#133024] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-md mt-4 cursor-pointer"
            >
              I understand
            </button>
          </div>
        )}

        {/* Screen 4: Location permission */}
        {step === 4 && (
          <div className="flex flex-col gap-6 text-center items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1b4332] flex items-center justify-center border border-emerald-100">
              <MapPin size={24} className="text-[#2d6a4f]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-foreground font-heading">Location permission</h2>
              <p className="text-xs text-muted leading-relaxed max-w-xs">
                We use your location to show nearby tasks and verify work. We only track location while you are using CivicTree or doing a task.
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-[#1b4332] hover:bg-[#133024] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-md mt-4 cursor-pointer"
            >
              Allow location
            </button>
          </div>
        )}

        {/* Screen 5: Payment setup */}
        {step === 5 && (
          <div className="flex flex-col gap-6 text-center items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1b4332] flex items-center justify-center border border-emerald-100">
              <DollarSign size={24} className="text-[#2d6a4f]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-foreground font-heading">Payment setup</h2>
              <p className="text-xs text-muted leading-relaxed max-w-xs">
                Add a payout method so you can get paid after tasks are approved.
              </p>
            </div>
            <div className="bg-[#faf9f5] border border-border p-4 rounded-2xl w-full text-left flex items-center justify-between text-xs font-semibold text-muted">
              <span>Mock payout account (routing details)</span>
              <span className="text-[#2d6a4f] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 text-[10px]">Active</span>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-[#1b4332] hover:bg-[#133024] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-md mt-4 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Screen 6: Profile setup */}
        {step === 6 && (
          <div className="flex flex-col gap-4 text-left">
            <div className="text-center flex flex-col items-center gap-1 mb-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center border border-border">
                <UserIcon size={20} />
              </div>
              <h2 className="text-lg font-bold text-foreground font-heading mt-2">Profile setup</h2>
              <p className="text-xs text-muted">Introduce yourself to the local community.</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border border-[#e6e8e4] px-4 py-2.5 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Phone number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border border-[#e6e8e4] px-4 py-2.5 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Neighborhood</label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="bg-white border border-[#e6e8e4] px-4 py-2.5 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white border border-[#e6e8e4] px-4 py-2.5 rounded-xl text-xs focus:outline-none"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-[#1b4332] hover:bg-[#133024] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-md mt-4 cursor-pointer text-center"
            >
              Continue
            </button>
          </div>
        )}

        {/* Screen 7: Safety Quiz */}
        {step === 7 && (
          <div className="flex flex-col gap-5 text-left">
            <div className="text-center flex flex-col items-center gap-1 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-lg font-bold text-foreground font-heading mt-2">First safety quiz</h2>
              <p className="text-xs text-muted">A quick check before you start cleaning.</p>
            </div>

            <div className="bg-[#faf9f5] border border-border p-4 rounded-xl">
              <span className="text-xs font-bold text-foreground">
                What should you do if you see a needle?
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${quizAnswer === 'pick' ? 'border-[#1b4332] bg-emerald-50/20' : 'border-[#e6e8e4] hover:bg-neutral-50'}`}>
                <input
                  type="radio"
                  name="quiz"
                  checked={quizAnswer === 'pick'}
                  onChange={() => setQuizAnswer('pick')}
                  className="hidden"
                />
                <span className="text-xs text-[#555] font-semibold">Pick it up carefully with gloves.</span>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${quizAnswer === 'report' ? 'border-[#1b4332] bg-emerald-50/20' : 'border-[#e6e8e4] hover:bg-neutral-50'}`}>
                <input
                  type="radio"
                  name="quiz"
                  checked={quizAnswer === 'report'}
                  onChange={() => setQuizAnswer('report')}
                  className="hidden"
                />
                <span className="text-xs text-[#555] font-semibold">Step back and report it.</span>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${quizAnswer === 'trash' ? 'border-[#1b4332] bg-emerald-50/20' : 'border-[#e6e8e4] hover:bg-neutral-50'}`}>
                <input
                  type="radio"
                  name="quiz"
                  checked={quizAnswer === 'trash'}
                  onChange={() => setQuizAnswer('trash')}
                  className="hidden"
                />
                <span className="text-xs text-[#555] font-semibold">Throw it into the standard trash bag.</span>
              </label>
            </div>

            {quizSubmitted && quizError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs font-bold">
                That is not correct. Needles are dangerous. Always step back and report them. Try again.
              </div>
            )}

            {quizSubmitted && !quizError && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle size={14} />
                Correct! Safety first.
              </div>
            )}

            {!(!quizError && quizSubmitted) && (
              <button
                onClick={handleQuizSubmit}
                className="w-full bg-[#1b4332] hover:bg-[#133024] text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-md mt-2 cursor-pointer text-center"
              >
                Submit Answer
              </button>
            )}
          </div>
        )}

        {/* Screen 8: Ready */}
        {step === 8 && (
          <div className="flex flex-col gap-6 text-center items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-primary flex items-center justify-center border border-emerald-100">
              <CheckCircle size={32} className="text-[#2d6a4f]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-foreground font-heading">You’re ready.</h2>
              <p className="text-sm text-muted leading-relaxed">
                You’re ready for beginner tasks. Let's see what needs doing today.
              </p>
            </div>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full bg-[#1b4332] hover:bg-[#133024] disabled:bg-emerald-950/45 text-white py-4 rounded-2xl font-extrabold text-sm transition-all shadow-md mt-4 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : 'Show me tasks'}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Back button option (hidden on step 1 & 8) */}
      {step > 1 && step < 8 && (
        <div className="px-6 text-center">
          <button
            onClick={handleBack}
            className="text-xs text-muted hover:text-foreground font-bold cursor-pointer transition-all"
          >
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
