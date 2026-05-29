// src/app/worker/training/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, ShieldAlert, Award, ArrowLeft } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  time: string;
  desc: string;
  unlocks: string;
  dbFlag: string;
  quizQuestion: string;
  quizOptions: string[];
  correctIndex: number;
}

export default function Training() {
  const router = useRouter();
  const [userId, setUserId] = useState('worker-austin-id');
  const [unlockedTypes, setUnlockedTypes] = useState<string[]>(['beginner']);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  
  // Quiz states
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [saving, setSaving] = useState(false);

  const modules: Module[] = [
    {
      id: 'basics',
      title: 'CivicTree Basics',
      time: '3 minutes',
      desc: 'Learn how to claim work, track tasks, and get paid.',
      unlocks: 'Beginner tasks',
      dbFlag: 'beginner',
      quizQuestion: 'Where does your payout go after a task is approved?',
      quizOptions: [
        'It goes to your available balance where you can cash it out.',
        'It is sent automatically to the city administration.',
        'It is locked in a prize pool for next week.',
      ],
      correctIndex: 0,
    },
    {
      id: 'photo',
      title: 'Photo Proof Basics',
      time: '4 minutes',
      desc: 'Understand how to take clear, well-framed before and after photos.',
      unlocks: 'Verification micro-tasks',
      dbFlag: 'verify',
      quizQuestion: 'What makes a good "after" verification photo?',
      quizOptions: [
        'A close-up of a flower or street sign.',
        'A wide photo showing the exact same angle as the before photo, showing the completed work.',
        'A selfie of you smiling near the location.',
      ],
      correctIndex: 1,
    },
    {
      id: 'planters',
      title: 'Planter Care Basics',
      time: '5 minutes',
      desc: 'Learn how to check soil moisture and water public planters correctly.',
      unlocks: 'Planter routes',
      dbFlag: 'planter',
      quizQuestion: 'How much water do most corridor planters need during a hot day?',
      quizOptions: [
        'Just a quick splash on the leaves.',
        'Water thoroughly until the soil is damp, reporting any structural damage.',
        'Flood the planter box until water pours into active traffic.',
      ],
      correctIndex: 1,
    },
  ];

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find((row) => row.startsWith('civictree_user_id='));
    const activeUserId = userCookie ? userCookie.split('=')[1] : 'worker-austin-id';
    setUserId(activeUserId);

    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${activeUserId}`);
        if (res.ok) {
          const user = await res.json();
          if (user.unlockedTaskTypes) {
            setUnlockedTypes(user.unlockedTaskTypes.split(',').map((s: string) => s.trim()));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  const handleStart = (m: Module) => {
    setActiveModule(m);
    setSelectedAns(null);
    setQuizSubmitted(false);
    setQuizError(false);
  };

  const handleAnswerSubmit = async () => {
    if (!activeModule || selectedAns === null) return;
    setQuizSubmitted(true);

    if (selectedAns === activeModule.correctIndex) {
      setQuizError(false);
      setSaving(true);
      
      const newTypes = unlockedTypes.includes(activeModule.dbFlag)
        ? unlockedTypes
        : [...unlockedTypes, activeModule.dbFlag];

      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            unlockedTaskTypes: newTypes.join(','),
          }),
        });

        if (res.ok) {
          setUnlockedTypes(newTypes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
        // Small timeout then close modal
        setTimeout(() => {
          setActiveModule(null);
        }, 1200);
      }
    } else {
      setQuizError(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto bg-white min-h-screen border-x border-border shadow-sm pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border py-4 px-4 sticky top-[38px] z-10 flex items-center gap-4">
        <Link href="/worker/today" className="text-muted hover:text-foreground shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-sm font-bold tracking-tight text-foreground font-heading">
          Safety & Skill Training
        </h1>
      </div>

      <div className="p-5 flex flex-col gap-6 flex-1">
        {/* Intro */}
        <div>
          <h2 className="text-lg font-black text-foreground font-heading">Unlock more paid tasks</h2>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Finish short training modules to learn safety basics and unlock higher-paying task categories on your map.
          </p>
        </div>

        {/* Modules List */}
        <div className="flex flex-col gap-4">
          {modules.map((m) => {
            const isCompleted = unlockedTypes.includes(m.dbFlag);
            return (
              <div 
                key={m.id}
                className={`border p-5 rounded-2xl flex flex-col gap-4 shadow-sm transition-all ${
                  isCompleted 
                    ? 'bg-emerald-50/30 border-emerald-100' 
                    : 'bg-white border-border hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                      {m.time} &bull; Unlocks {m.unlocks}
                    </span>
                    <h3 className="text-sm font-bold text-foreground font-heading">{m.title}</h3>
                  </div>
                  
                  {isCompleted ? (
                    <span className="text-[#2d6a4f] bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100 flex items-center gap-1">
                      <CheckCircle size={10} />
                      Completed
                    </span>
                  ) : (
                    <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-100">
                      Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#555] leading-relaxed">{m.desc}</p>

                {!isCompleted && (
                  <button
                    onClick={() => handleStart(m)}
                    className="w-full bg-[#1b4332] hover:bg-[#133024] text-white font-bold py-2.5 rounded-xl text-xs transition-all mt-1 cursor-pointer text-center"
                  >
                    Start training
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz Modal Overlay */}
      {activeModule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 flex flex-col gap-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">
                  Lesson Quiz
                </span>
                <h4 className="text-sm font-bold text-[#111] font-heading mt-1">
                  {activeModule.title}
                </h4>
              </div>
              <button 
                onClick={() => setActiveModule(null)}
                className="text-xs font-bold text-muted hover:text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="bg-slate-50 border border-border p-4 rounded-xl text-xs text-foreground font-medium leading-relaxed">
              {activeModule.quizQuestion}
            </div>

            <div className="flex flex-col gap-2.5">
              {activeModule.quizOptions.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => { setSelectedAns(oIdx); setQuizSubmitted(false); }}
                  className={`text-left p-3.5 rounded-xl border text-xs font-semibold leading-relaxed transition-all ${
                    selectedAns === oIdx 
                      ? 'border-primary bg-emerald-50/20 text-[#111]' 
                      : 'border-border bg-white text-muted hover:bg-neutral-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {quizSubmitted && quizError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-[10px] font-bold">
                That is incorrect. Review safety guidelines and try again.
              </div>
            )}

            {quizSubmitted && !quizError && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                <CheckCircle size={12} />
                Passed! Unlocking skill...
              </div>
            )}

            {!(!quizError && quizSubmitted) && (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAns === null || saving}
                className="w-full bg-[#1b4332] hover:bg-[#133024] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Submit Answer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation tabs */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-border flex justify-around py-3 z-40 text-muted shadow-lg">
        <Link href="/worker/today" className="flex flex-col items-center gap-1 hover:text-foreground">
          <BookOpen size={20} className="opacity-50" />
          <span className="text-[9px] font-semibold tracking-wider uppercase">Today</span>
        </Link>
        <Link href="/worker/earn" className="flex flex-col items-center gap-1 hover:text-foreground">
          <Award size={20} className="opacity-50" />
          <span className="text-[9px] font-semibold tracking-wider uppercase">Earn</span>
        </Link>
        <Link href="/worker/training" className="flex flex-col items-center gap-1 text-primary">
          <CheckCircle size={20} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Training</span>
        </Link>
      </div>
    </div>
  );
}
