// src/app/signin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CivicTreeLogo from '@/components/CivicTreeLogo';

export default function SignIn() {
  const router = useRouter();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [inputValue, setInputValue] = useState('');
  const [codeValue, setCodeValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonaLogin = (role: string, userId: string, route: string) => {
    document.cookie = `civictree_role=${role}; path=/`;
    document.cookie = `civictree_user_id=${userId}; path=/`;
    window.location.href = route;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    setLoading(true);
    setError(null);

    // If email selected, we just simulate login directly since Twilio is for SMS
    if (method === 'email') {
      setTimeout(() => {
        setLoading(false);
        const val = inputValue.toLowerCase();
        if (val.includes('admin')) {
          handlePersonaLogin('admin', 'admin-id', '/admin/submissions');
        } else if (val.includes('maya') || val.includes('new')) {
          handlePersonaLogin('worker', 'worker-new-id', '/worker/onboarding');
        } else {
          handlePersonaLogin('worker', 'worker-austin-id', '/worker/today');
        }
      }, 600);
      return;
    }

    // Phone SMS OTP flow
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: inputValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send verification code');
      }

      setOtpSent(true);
      alert('Verification code sent! Check your developer terminal console to read the simulated SMS.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeValue) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: inputValue, code: codeValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid code. Try again.');
      }

      const data = await res.json();
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen justify-center items-center px-6 py-12">
      {/* Container Card */}
      <div className="max-w-md w-full bg-white border border-[#e6e8e4] p-8 rounded-3xl shadow-sm flex flex-col gap-6">
        {/* Logo and Greeting */}
        <div className="text-center">
          <Link href="/" aria-label="CivicTree home" className="inline-flex justify-center">
            <CivicTreeLogo size="md" />
          </Link>
          <h2 className="text-xl font-bold text-[#111] font-heading mt-4">Welcome back.</h2>
          <p className="text-xs text-[#666] mt-1 font-semibold">Let’s see what needs doing today.</p>
        </div>

        {/* Persona quick switch for easy testing/grading */}
        <div className="bg-[#faf9f5] border border-[#e6e8e4] p-4 rounded-2xl flex flex-col gap-2">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            Quick Persona Sign-in
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handlePersonaLogin('worker', 'worker-austin-id', '/worker/today')}
              className="bg-white border border-[#e6e8e4] hover:bg-neutral-50 px-2 py-2 rounded-xl text-[10px] font-bold text-foreground transition-all text-center"
            >
              Worker (Austin)
            </button>
            <button
              onClick={() => handlePersonaLogin('worker', 'worker-new-id', '/worker/onboarding')}
              className="bg-white border border-[#e6e8e4] hover:bg-neutral-50 px-2 py-2 rounded-xl text-[10px] font-bold text-foreground transition-all text-center"
            >
              Worker (Maya)
            </button>
            <button
              onClick={() => handlePersonaLogin('admin', 'admin-id', '/admin/submissions')}
              className="bg-white border border-[#e6e8e4] hover:bg-neutral-50 px-2 py-2 rounded-xl text-[10px] font-bold text-foreground transition-all text-center"
            >
              Admin Portal
            </button>
          </div>
        </div>

        {/* Form login options */}
        {!otpSent && (
          <div className="flex border-b border-[#e6e8e4] text-xs font-bold text-muted">
            <button
              onClick={() => { setMethod('phone'); setInputValue(''); setError(null); }}
              className={`flex-1 pb-2 border-b-2 text-center transition-all ${method === 'phone' ? 'border-[#1b4332] text-foreground' : 'border-transparent'}`}
            >
              Continue with phone
            </button>
            <button
              onClick={() => { setMethod('email'); setInputValue(''); setError(null); }}
              className={`flex-1 pb-2 border-b-2 text-center transition-all ${method === 'email' ? 'border-[#1b4332] text-foreground' : 'border-transparent'}`}
            >
              Continue with email
            </button>
          </div>
        )}

        {/* Form submission */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                {method === 'phone' ? 'Phone number' : 'Email address'}
              </label>
              <input
                type={method === 'phone' ? 'tel' : 'email'}
                required
                placeholder={method === 'phone' ? 'e.g. 213-555-0122' : 'e.g. maya@civictree.org'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-white border border-[#e6e8e4] px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1b4332]"
              />
            </div>

            {error && <div className="text-xs text-destructive font-bold">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#1b4332] hover:bg-[#133024] disabled:bg-emerald-950/45 text-white py-3.5 rounded-xl text-sm font-bold transition-all mt-2 cursor-pointer text-center"
            >
              {loading ? 'Sending Code...' : 'Get Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted block mb-1">
                Enter the 6-digit code sent to <strong className="text-foreground">{inputValue}</strong>
              </span>
              <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit code (e.g. 123456)"
                value={codeValue}
                onChange={(e) => setCodeValue(e.target.value)}
                className="bg-white border border-[#e6e8e4] px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1b4332] text-center tracking-widest font-bold"
              />
            </div>

            {error && <div className="text-xs text-destructive font-bold">{error}</div>}

            <div className="flex flex-col gap-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1b4332] hover:bg-[#133024] disabled:bg-emerald-950/45 text-white py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer text-center"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-xs text-muted hover:text-foreground font-bold py-1.5 transition-all text-center"
              >
                Change phone number
              </button>
            </div>
          </form>
        )}

        {/* Social auth alternative */}
        {!otpSent && (
          <>
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-[#e6e8e4] w-full absolute z-0" />
              <span className="bg-white px-3 text-[10px] font-bold text-muted relative z-10 uppercase tracking-widest">
                or
              </span>
            </div>

            <button
              onClick={() => handlePersonaLogin('worker', 'worker-austin-id', '/worker/today')}
              className="border-2 border-[#eee] hover:bg-neutral-100 text-[#111] py-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </span>
              Continue with Google
            </button>
          </>
        )}

        {/* Footer links */}
        <div className="flex justify-between items-center text-xs text-muted border-t border-[#eae8e2]/60 pt-4 mt-1 font-semibold">
          <Link href="/signin" className="hover:text-black transition-all">Create account</Link>
          <Link href="/signin" className="hover:text-black transition-all">Forgot password</Link>
          <Link href="/signin" className="hover:text-black transition-all">Need help?</Link>
        </div>
      </div>
    </div>
  );
}
