'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import CivicTreeLogo from '@/components/CivicTreeLogo';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  Camera,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Flag,
  HandCoins,
  Layers,
  Leaf,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Target,
  TreePine,
  Users,
  type LucideIcon,
} from 'lucide-react';

type Stage = 'welcome' | 'story' | 'home' | 'worker' | 'admin' | 'sponsor';

const storyPanels = [
  'Imagine waking up and seeing paid work near you.',
  'CivicTree turns neighborhood needs into paid tasks.',
  'Do the work. Submit proof. Get paid.',
  'This is a new way to care for a city.',
];

const workerActions: Array<[string, LucideIcon]> = [
  ['Find paid tasks', MapPin],
  ['Report something', Camera],
  ['Verify a nearby report', ShieldCheck],
  ['Finish safety training', ClipboardCheck],
  ['Join a campaign', Flag],
];

const taskStates = [
  'Reported',
  'Under Review',
  'Needs Permission',
  'Needs Funding',
  'Funded',
  'Open',
  'Offered',
  'Assigned',
  'In Progress',
  'Submitted',
  'Approved',
  'Paid',
  'Rejected',
  'Professional-only',
];

const neighborhoods = [
  ['Downtown', 'Improving', 'Lv 3', '5 reports', '12 tasks', '$4,200 paid'],
  ['South LA', 'Needs Care', 'Lv 1', '18 reports', '24 tasks', '$190 paid'],
  ['Koreatown', 'Active', 'Lv 2', '7 reports', '6 tasks', '$2,210 paid'],
  ['Venice', 'Thriving', 'Lv 4', '1 report', '2 tasks', '$7,840 paid'],
  ['Santa Monica', 'Fully Stewarded', 'Lv 4', '0 reports', '1 task', '$11,200 paid'],
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function PitchExperience() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [panel, setPanel] = useState(0);
  const [workerStep, setWorkerStep] = useState(0);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [taskSubmitted, setTaskSubmitted] = useState(false);

  const progress = useMemo(() => ((panel + 1) / storyPanels.length) * 100, [panel]);

  const begin = () => {
    setPanel(0);
    setStage('story');
  };

  const nextStory = () => {
    if (panel < storyPanels.length - 1) {
      setPanel(panel + 1);
    } else {
      setStage('home');
    }
  };

  return (
    <main className="pitch-shell min-h-screen overflow-hidden bg-[#07110d] text-[#f6f2e8]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 pitch-grid opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(111,170,117,0.22),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(233,176,83,0.13),transparent_24%),linear-gradient(180deg,rgba(7,17,13,0.2),#07110d_72%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/55 to-transparent" />
      </div>

      {stage === 'welcome' && (
        <section className="relative flex min-h-screen items-center px-6 py-10 md:px-12">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="max-w-3xl animate-pitch-rise">
              <CivicTreeLogo
                size="lg"
                tone="dark"
                className="mb-8"
              />
              <div className="mb-7 inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#d9c477]">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#d9c477]/75" />
                <span className="border-y border-[#d9c477]/30 py-1 [text-shadow:0_0_22px_rgba(217,196,119,0.2)]">
                  Civic earning platform
                </span>
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#d9c477]/75" />
              </div>
              <h1 className="text-5xl font-black leading-[0.98] tracking-tight md:text-7xl lg:text-8xl">
                Welcome to CivicTree.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d7ddcf] md:text-2xl">
                A new way to earn money by taking care of the place you live.
              </p>
              <button
                type="button"
                onClick={begin}
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#f0c66a] px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#07110d] shadow-[0_20px_70px_rgba(240,198,106,0.24)] transition hover:-translate-y-0.5 hover:bg-[#ffe09a]"
              >
                Begin
                <ChevronRight size={18} />
              </button>
            </div>

            <WelcomeShowcase />
          </div>
        </section>
      )}

      {stage === 'story' && (
        <section className="relative flex min-h-screen flex-col px-6 py-8 md:px-12">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-[#9fb0a2]">
            <span>CivicTree</span>
            <span>{panel + 1} / {storyPanels.length}</span>
          </div>
          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#f0c66a] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1fr_420px]">
            <div key={panel} className="animate-pitch-rise">
              <p className="max-w-5xl text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
                {storyPanels[panel]}
              </p>
            </div>
            <StoryVisual index={panel} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => (panel === 0 ? setStage('welcome') : setPanel(panel - 1))}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-[#d7ddcf] transition hover:bg-white/8"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              type="button"
              onClick={nextStory}
              className="inline-flex items-center gap-3 rounded-full bg-[#f6f2e8] px-6 py-3 text-sm font-black text-[#07110d] transition hover:bg-white"
            >
              {panel === storyPanels.length - 1 ? 'Enter CivicTree Demo' : 'Continue'}
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      )}

      {stage === 'home' && (
        <ProductHome
          onBack={() => setStage('welcome')}
          onWalkthrough={begin}
          onWorker={() => setStage('worker')}
          onAdmin={() => setStage('admin')}
          onSponsor={() => setStage('sponsor')}
        />
      )}

      {stage === 'worker' && (
        <DemoFrame title="Worker Experience" subtitle="A mobile field app for paid civic work." onBack={() => setStage('home')}>
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="rounded-[2.5rem] border-[10px] border-[#101814] bg-white shadow-2xl">
              <WorkerPhone step={workerStep} reportSubmitted={reportSubmitted} taskSubmitted={taskSubmitted} />
            </div>
            <div className="grid content-start gap-4">
              <DemoTabs
                items={['Today', 'Map', 'Report', 'Task', 'Earnings', 'Impact']}
                active={workerStep}
                onChange={setWorkerStep}
              />
              <WorkerExplainer
                step={workerStep}
                onSubmitReport={() => {
                  setReportSubmitted(true);
                  setWorkerStep(3);
                }}
                onSubmitTask={() => {
                  setTaskSubmitted(true);
                  setWorkerStep(4);
                }}
              />
            </div>
          </div>
        </DemoFrame>
      )}

      {stage === 'admin' && (
        <DemoFrame title="Admin Experience" subtitle="A desktop command center for turning reports into funded, verified work." onBack={() => setStage('home')}>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <AdminMap />
            <div className="grid gap-4">
              <AdminQueue />
              <AdminTaskBuilder />
            </div>
          </div>
        </DemoFrame>
      )}

      {stage === 'sponsor' && (
        <DemoFrame title="Sponsor Experience" subtitle="Fund a block. See the work. Track the impact." onBack={() => setStage('home')}>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <SponsorCard />
            <SponsorResults />
          </div>
        </DemoFrame>
      )}
    </main>
  );
}

function WelcomeShowcase() {
  const steps = [
    ['Report', 'A neighbor marks what needs care.', Camera],
    ['Fund', 'A sponsor puts real money behind it.', HandCoins],
    ['Verify', 'Proof turns work into payment.', ShieldCheck],
  ] as const;

  return (
    <div className="relative min-h-[560px] animate-pitch-float py-3">
      <div className="absolute -inset-10 rounded-full bg-[#74b77f]/12 blur-3xl" />
      <div className="relative mx-auto max-w-[740px] overflow-hidden rounded-[2rem] border border-white/16 bg-[#07110d]/82 p-6 shadow-[0_32px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_16%,rgba(255,255,255,0.10),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_48%)]" />
        <div className="relative h-[330px] overflow-hidden rounded-[1.55rem] border border-white/12 bg-[#14241b] shadow-[inset_0_0_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 pitch-map-dark" />
          {[
            ['left-[16%] top-[24%]', 'Trash on Oak', '$18'],
            ['left-[57%] top-[20%]', 'Planter care', '$12'],
            ['left-[30%] top-[66%]', 'Bench repair', 'Review'],
            ['left-[66%] top-[62%]', 'Clean alleyway', '42%'],
          ].map(([position, title, meta]) => (
            <div key={title} className={`absolute ${position} rounded-2xl border border-[#fff8e4]/80 bg-[#f8f2e6]/95 px-5 py-4 text-[#102118] shadow-[0_18px_34px_rgba(0,0,0,0.28)]`}>
              <div className="text-xs font-black">{title}</div>
              <div className="mt-1 text-[11px] font-bold text-[#2d6a4f]">{meta}</div>
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-[#f6f2e8] bg-[#2d6a4f] text-white shadow-[0_0_0_16px_rgba(240,198,106,0.09),0_22px_58px_rgba(0,0,0,0.38)]">
            <MapPin size={26} />
          </div>
        </div>

        <div className="relative mt-5 grid gap-5 rounded-[1.55rem] border border-[#f0c66a]/24 bg-[#0b1410]/92 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:grid-cols-[1fr_1.35fr]">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#f0c66a]">Broadway Block Reset</div>
            <div className="mt-3 text-4xl font-black tracking-tight">$4,200 paid</div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs font-black text-[#c6d3c5]">
              <span>128 tasks</span>
              <span>18 blocks</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/12">
              <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-[#f0c66a] to-[#ffd978] shadow-[0_0_24px_rgba(240,198,106,0.48)]" />
            </div>
            <p className="mt-3 text-xs leading-5 text-[#c6d3c5]">Verified work turns neighborhood care into real earnings.</p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-5 grid max-w-[740px] gap-4 md:grid-cols-3">
        {steps.map(([title, copy, Icon]) => (
          <div key={title} className="rounded-[1.5rem] border border-[#fff8e4]/90 bg-gradient-to-br from-[#fff8e8] to-[#eee6d6] p-6 text-[#102118] shadow-[0_24px_58px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.85)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d46b] to-[#d9b852] text-[#07110d] shadow-[0_10px_22px_rgba(120,91,26,0.2)]">
              <Icon size={20} />
            </div>
            <h3 className="mt-6 text-3xl font-black leading-tight">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#4e5d50]">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductHome({
  onBack,
  onWalkthrough,
  onWorker,
  onAdmin,
  onSponsor,
}: {
  onBack: () => void;
  onWalkthrough: () => void;
  onWorker: () => void;
  onAdmin: () => void;
  onSponsor: () => void;
}) {
  return (
    <section className="relative min-h-screen overflow-y-auto bg-[#fffefa] text-[#101814]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(221,238,213,0.36),transparent_28%),radial-gradient(circle_at_20%_38%,rgba(235,245,230,0.38),transparent_24%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 md:px-10">
        <nav className="flex items-center justify-between gap-6">
          <button type="button" onClick={onBack} aria-label="Back to CivicTree welcome">
            <CivicTreeLogo size="md" />
          </button>
          <div className="hidden items-center gap-12 text-base font-bold text-[#1c261f] md:flex">
            <button type="button" onClick={onWalkthrough} className="transition hover:text-[#067333]">
              How it works
            </button>
            <Link href="/earn" className="transition hover:text-[#067333]">
              Earn
            </Link>
            <Link href="/for-cities" className="transition hover:text-[#067333]">
              For Cities
            </Link>
            <Link href="/sponsor" className="transition hover:text-[#067333]">
              Sponsor
            </Link>
          </div>
          <Link href="/signin" className="rounded-2xl border border-[#d9ded6] bg-white px-6 py-3 text-sm font-black text-[#101814] shadow-[0_8px_24px_rgba(16,24,20,0.06)]">
            Sign in
          </Link>
        </nav>

        <div className="relative flex-1 pb-8 pt-10">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.08em] text-[#2e7144]">
                <Leaf size={16} strokeWidth={2.4} />
                Stronger blocks. Better cities. Paid.
              </div>
              <h2 className="mt-8 max-w-2xl text-5xl font-black leading-[1.04] tracking-tight text-[#101814] md:text-7xl">
                Get paid to fix your neighborhood.
              </h2>
              <div className="mt-3 w-[92%] max-w-[620px]" aria-hidden="true">
                <svg viewBox="0 0 620 48" className="h-11 w-full overflow-visible" preserveAspectRatio="none">
                  <path
                    d="M8 30 C84 26 153 27 228 25 C312 22 393 24 474 22 C532 21 579 23 612 20"
                    fill="none"
                    stroke="#8fd49f"
                    strokeLinecap="round"
                    strokeWidth="18"
                    opacity="0.54"
                  />
                  <path
                    d="M13 34 C93 29 166 32 244 29 C326 25 402 28 486 25 C542 23 584 26 609 23"
                    fill="none"
                    stroke="#66c47d"
                    strokeLinecap="round"
                    strokeWidth="14"
                    opacity="0.38"
                  />
                  <path
                    d="M18 25 C105 23 172 24 259 22 C342 19 423 22 504 19 C553 18 589 19 616 17"
                    fill="none"
                    stroke="#c9edbc"
                    strokeLinecap="round"
                    strokeWidth="8"
                    opacity="0.42"
                  />
                  <path
                    d="M3 37 C74 34 158 35 244 33 C344 31 440 33 529 30 C567 29 594 30 617 28"
                    fill="none"
                    stroke="#4fb36a"
                    strokeLinecap="round"
                    strokeWidth="5"
                    opacity="0.22"
                  />
                </svg>
              </div>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#3f4b44] md:text-xl">
                CivicTree turns local cleanup and repair into paid civic tasks. Find nearby work, make money, and help your block thrive.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link href="/worker/map" className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#067333] px-8 py-4 text-base font-black text-white shadow-[0_18px_36px_rgba(6,115,51,0.24)]">
                  <MapPin size={21} />
                  Find tasks near me
                </Link>
                <Link href="/sponsor" className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#dfe4dc] bg-white px-8 py-4 text-base font-black text-[#101814] shadow-[0_12px_26px_rgba(16,24,20,0.05)]">
                  <Building2 size={21} />
                  Sponsor a block
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-semibold text-[#385146]">
                {['No fees to join', 'Paid weekly', 'Trusted by cities'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <Check size={17} className="text-[#067333]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-visible rounded-[2rem] lg:-ml-10">
              <div className="absolute inset-0 rounded-[2rem] bg-[#dfe8da] shadow-[0_28px_80px_rgba(13,35,22,0.14)]" />
              <div className="relative h-[430px] overflow-hidden rounded-[2rem] border border-[#e2e7df]">
              <Image
                src="/volunteers_working.png"
                alt="CivicTree workers caring for a neighborhood block"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 720px, 100vw"
                priority
              />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#fffefa]/80 to-transparent" />
              <div className="absolute right-6 top-6 text-sm font-black uppercase tracking-[0.08em] text-white [text-shadow:0_2px_12px_rgba(0,45,24,0.64)]">
                Better blocks together
              </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 mt-9 grid overflow-hidden rounded-[1.75rem] border border-[#e1e7df] bg-white shadow-[0_24px_70px_rgba(18,26,22,0.08)] lg:grid-cols-[1fr_1fr_1fr_330px] lg:items-stretch">
            {[
              ['1', 'Find tasks', 'See nearby tasks on your block and beyond.', MapPin],
              ['2', 'Do the work', 'Complete cleanup or repair tasks. Track your impact.', ClipboardCheck],
              ['3', 'Get paid', 'Earn cash rewards and build a record of trusted work.', CircleDollarSign],
            ].map(([number, title, copy, Icon], index) => (
              <div key={title as string} className={cn('relative min-h-[198px] px-6 py-7', index > 0 && 'lg:border-l lg:border-[#e2e5de]')}>
                <div className="inline-flex rounded-lg border border-[#d8ead4] bg-[#f3f8f1] px-3 py-1.5 text-sm font-black text-[#237446]">
                  Step {number as string}
                </div>
                <div className="mt-7 grid grid-cols-[72px_minmax(0,1fr)] items-center gap-5">
                  <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[1.2rem] bg-[#dff1da] text-[#237446]">
                    <Icon size={34} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="whitespace-nowrap text-xl font-black leading-tight text-[#101814]">{title as string}</h3>
                    <p className="mt-3 text-base leading-7 text-[#4d5a52]">{copy as string}</p>
                  </div>
                </div>
                {index < 2 && (
                  <div className="absolute right-[-18px] top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#dfe7dd] bg-white text-[#237446] shadow-sm lg:flex">
                    <ChevronRight size={22} strokeWidth={2.5} />
                  </div>
                )}
              </div>
            ))}
            <div className="m-6 overflow-hidden rounded-[1.35rem] border border-[#dde3dc] bg-[#f5f7f3] lg:ml-3">
              <div className="flex h-16 items-center justify-between border-b border-[#dde3dc] bg-white px-6">
                <div className="text-xl font-black text-[#101814]">Nearby tasks</div>
                <div className="rounded-lg border border-[#d8ead4] bg-[#eaf3e8] px-3 py-1.5 text-base font-black text-[#2e7144]">12</div>
              </div>
              <div className="relative h-[144px]">
                <div className="absolute inset-0 pitch-map-light opacity-70" />
                {['left-[18%] top-[17%]', 'left-[62%] top-[20%]', 'left-[66%] top-[70%]'].map((position) => (
                  <MapPin key={position} className={`absolute ${position} text-[#2e7144] drop-shadow`} size={28} fill="#2e7144" />
                ))}
                <div className="absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-[1.25rem] bg-white p-4 shadow-[0_16px_30px_rgba(22,32,26,0.12)]">
                  <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-xl bg-[#dfe8da]">
                    <Image src="/task_thumbnail.png" alt="Clean litter task" fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[#101814]">Clean litter on Oak St</div>
                    <div className="mt-1 text-sm text-[#6a746d]">0.2 mi away</div>
                  </div>
                  <div className="rounded-lg border border-[#d8ead4] bg-[#eaf3e8] px-3 py-2.5 text-base font-black text-[#2e7144]">$18</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 rounded-[1.5rem] border border-[#e2e5de] bg-white p-5 shadow-sm md:grid-cols-4">
            {[
              ['3,200', 'tasks completed', Check],
              ['$84k', 'paid to workers', CircleDollarSign],
              ['128', 'blocks improved', Building2],
              ['4.9/5', 'from 1,250+ users', Sparkles],
            ].map(([value, label, Icon]) => (
              <div key={label as string} className="flex items-center gap-4 md:border-r md:border-[#e2e5de] md:last:border-r-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#d6efcf] text-[#2e7144]">
                  <Icon size={27} />
                </div>
                <div>
                  <div className="text-2xl font-black">{value as string}</div>
                  <div className="text-sm text-[#4d5a52]">{label as string}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <PathButton title="Worker Experience" copy="Open the mobile field app and complete a paid task." icon={Users} onClick={onWorker} />
            <PathButton title="Admin Experience" copy="Review reports, fund tasks, and verify work." icon={Layers} onClick={onAdmin} />
            <PathButton title="Sponsor Experience" copy="Fund a block and see verified results." icon={Building2} onClick={onSponsor} />
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryVisual({ index }: { index: number }) {
  const visuals: Array<[LucideIcon, string, string]> = [
    [MapPin, 'Nearby work', '3 tasks within 1 mile'],
    [AlertTriangle, 'Needs care', 'Alley, planter, bench'],
    [Target, 'Unowned', 'Problems without a system'],
    [Sparkles, 'CivicTree', 'Report, fund, verify, pay'],
    [ClipboardCheck, 'Verified loop', 'Every step has proof'],
    [TreePine, 'Self-repairing city', 'Small fixes every day'],
    [CircleDollarSign, 'Incentives', 'Useful work gets rewarded'],
    [HandCoins, 'Earn by helping', '$18 pending'],
    [Banknote, 'Supplemental income', 'Human work with local value'],
    [ShieldCheck, 'Trust and care', 'Judgment matters'],
    [Leaf, 'Real earning system', 'Care becomes infrastructure'],
    [Navigation, 'Demo ready', 'Click through the flow'],
  ];
  const [Icon, title, copy] = visuals[index];

  return (
    <div key={index} className="relative hidden min-h-[420px] items-center justify-center lg:flex">
      <div className="absolute inset-6 rounded-full border border-[#f0c66a]/10" />
      <div className="absolute inset-16 rounded-full border border-[#9ed5a8]/10" />
      <div className="relative w-full max-w-sm rounded-[2rem] border border-white/12 bg-white/[0.06] p-7 shadow-2xl backdrop-blur">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0c66a] text-[#07110d]">
          <Icon size={30} />
        </div>
        <h3 className="mt-8 text-2xl font-black">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#c6d3c5]">{copy}</p>
      </div>
    </div>
  );
}

function PathButton({
  title,
  copy,
  icon: Icon,
  onClick,
}: {
  title: string;
  copy: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group rounded-3xl border border-[#dfe1d6] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Icon className="text-[#2d6a4f]" size={26} />
      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#667067]">{copy}</p>
        </div>
        <ChevronRight className="shrink-0 text-[#2d6a4f] transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}

function DemoFrame({ title, subtitle, onBack, children }: { title: string; subtitle: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <section className="relative min-h-screen overflow-y-auto px-4 py-5 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <button onClick={onBack} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-xs font-bold text-[#c6d3c5] hover:bg-white/8">
              <ArrowLeft size={14} />
              Back to demo paths
            </button>
            <h2 className="text-4xl font-black tracking-tight md:text-6xl">{title}</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#c6d3c5]">{subtitle}</p>
          </div>
          <div className="rounded-full border border-[#f0c66a]/25 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#f0c66a]">
            Guided prototype
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function DemoTabs({ items, active, onChange }: { items: string[]; active: number; onChange: (index: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.05] p-2">
      {items.map((item, index) => (
        <button
          key={item}
          onClick={() => onChange(index)}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-black transition',
            active === index ? 'bg-[#f0c66a] text-[#07110d]' : 'text-[#c6d3c5] hover:bg-white/8',
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function WorkerPhone({ compact = false, step = 0, reportSubmitted = false, taskSubmitted = false }: { compact?: boolean; step?: number; reportSubmitted?: boolean; taskSubmitted?: boolean }) {
  return (
    <div className={cn('min-h-[660px] overflow-hidden rounded-[1.85rem] bg-[#f7f7f1] text-[#102118]', compact && 'min-h-[405px] scale-[0.96]')}>
      <div className="bg-[#174631] px-5 pb-6 pt-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-black">Good morning.</h3>
            <p className="mt-1 text-sm text-[#bce0c4]">12 things need care near you.</p>
          </div>
          <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black">Level 3</div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-black/20 p-4">
          <div><div className="text-[10px] font-bold uppercase text-[#bce0c4]">$24 available</div><div className="mt-1 text-2xl font-black">$24</div></div>
          <div className="border-l border-white/10 pl-3"><div className="text-[10px] font-bold uppercase text-[#bce0c4]">$18 pending</div><div className="mt-1 text-2xl font-black">$18</div></div>
        </div>
      </div>
      <div className="space-y-4 p-5">
        {step === 2 && reportSubmitted ? (
          <SuccessBlock title="Report submitted." copy="We'll check this. If approved, it may become a paid task." />
        ) : step === 3 ? (
          <TaskCard submitted={taskSubmitted} />
        ) : step === 4 ? (
          <EarningsCard />
        ) : step === 5 ? (
          <ImpactCard />
        ) : step === 1 ? (
          <WorkerMap />
        ) : (
          <>
            <div className="rounded-3xl bg-[#174631] p-5 text-white">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#bce0c4]">Next step</div>
              <h4 className="mt-2 text-xl font-black">3 paid tasks nearby.</h4>
              <p className="mt-2 text-sm text-[#d7ead9]">Broadway Block Reset is 42% complete.</p>
            </div>
            <div className="space-y-3">
              {workerActions.map(([label, Icon]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#dfe3d7] bg-white p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f2e5] text-[#2d6a4f]"><Icon size={18} /></div>
                  <span className="text-sm font-black">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function WorkerMap() {
  const streets = [
    ['Culver Blvd', 'left-[-12%] top-[46%] h-5 w-[128%] rotate-[-13deg]', 'left-[18%] top-[39%] rotate-[-13deg]'],
    ['Washington Blvd', 'left-[-8%] top-[65%] h-5 w-[118%] rotate-[25deg]', 'left-[33%] top-[72%] rotate-[25deg]'],
    ['Main St', 'left-[45%] top-[-8%] h-[116%] w-4 rotate-[17deg]', 'left-[50%] top-[25%] rotate-[107deg]'],
    ['Cardiff Ave', 'left-[18%] top-[-10%] h-[115%] w-3 rotate-[18deg]', 'left-[20%] top-[18%] rotate-[108deg]'],
    ['Duquesne Ave', 'left-[72%] top-[-8%] h-[112%] w-3 rotate-[18deg]', 'left-[72%] top-[48%] rotate-[108deg]'],
    ['Lafayette Pl', 'left-[2%] top-[25%] h-3 w-[95%] rotate-[6deg]', 'left-[7%] top-[22%] rotate-[6deg]'],
    ['Irving Pl', 'left-[4%] top-[82%] h-3 w-[88%] rotate-[6deg]', 'left-[9%] top-[82%] rotate-[6deg]'],
  ];
  const blocks = [
    'left-[7%] top-[8%] h-[18%] w-[24%]',
    'left-[33%] top-[6%] h-[20%] w-[18%]',
    'left-[57%] top-[8%] h-[18%] w-[18%]',
    'left-[78%] top-[13%] h-[20%] w-[15%]',
    'left-[8%] top-[33%] h-[22%] w-[21%]',
    'left-[33%] top-[34%] h-[18%] w-[18%]',
    'left-[58%] top-[35%] h-[20%] w-[20%]',
    'left-[78%] top-[42%] h-[16%] w-[15%]',
    'left-[7%] top-[62%] h-[18%] w-[23%]',
    'left-[36%] top-[61%] h-[24%] w-[17%]',
    'left-[60%] top-[65%] h-[18%] w-[18%]',
    'left-[80%] top-[66%] h-[18%] w-[13%]',
  ];
  const tasks = [
    ['Paid task', 'Planter refresh', 'Culver Blvd', '$18', 'left-[21%] top-[30%]', 'bg-white'],
    ['Report', 'Bench repair', 'Town Plaza', '$4', 'left-[55%] top-[25%]', 'bg-white'],
    ['Campaign', 'Main St reset', '38%', 'Active', 'left-[33%] top-[58%]', 'bg-[#fff7d8]'],
    ['Done', 'Trash cleared', 'Cardiff garage', 'Paid', 'left-[63%] top-[67%]', 'bg-white'],
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-[#dfe3d7] bg-[#edf1e8]">
      <div className="relative h-[420px] overflow-hidden">
        <div className="absolute inset-0 bg-[#edf1e8]" />
        <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(rgba(45,106,79,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(45,106,79,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
        {blocks.map((pos) => (
          <div key={pos} className={cn('absolute rounded-xl border border-[#d6dfd3] bg-[#f8f7ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]', pos)} />
        ))}
        <div className="absolute left-[5%] top-[8%] h-[18%] w-[20%] rounded-2xl bg-[#d8ead4]">
          <span className="absolute left-3 top-3 text-[9px] font-black uppercase text-[#2d6a4f]">Media Park</span>
        </div>
        <div className="absolute right-[6%] top-[8%] h-[16%] w-[18%] rounded-2xl bg-[#d8ead4]">
          <span className="absolute left-3 top-3 text-[9px] font-black uppercase text-[#2d6a4f]">City Hall</span>
        </div>
        {streets.map(([label, roadPos, labelPos]) => (
          <div key={label}>
            <div className={cn('absolute rounded-full bg-white shadow-[0_0_0_1px_rgba(122,138,120,0.18)]', roadPos)} />
            <span className={cn('absolute rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#5d6a60] shadow-sm', labelPos)}>
              {label}
            </span>
          </div>
        ))}
        <div className="absolute left-[48%] top-[41%] rounded-full bg-[#174631] px-3 py-1 text-[10px] font-black text-white shadow-lg">
          Downtown Culver City
        </div>
        <div className="absolute left-[11%] bottom-[6%] rounded-xl border border-[#cad6c6] bg-white/80 px-3 py-2 text-[9px] font-bold text-[#526055] shadow-sm">
          Cardiff public parking
        </div>
        {tasks.map(([kind, title, location, meta, pos, cardColor]) => (
          <div key={title} className={cn('absolute rounded-2xl border border-[#dce3d8] p-3 shadow-[0_14px_32px_rgba(29,53,37,0.16)]', cardColor, pos)}>
            <div className="text-[9px] font-black uppercase text-[#2d6a4f]">{kind}</div>
            <div className="mt-1 text-xs font-black">{title}</div>
            <div className="mt-1 text-[10px] font-bold text-[#5e6b5f]">{location}</div>
            <div className="mt-1 text-[11px] text-[#667067]">{meta}</div>
          </div>
        ))}
        <div className="absolute left-[49%] top-[50%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-white bg-blue-500 shadow-[0_0_0_8px_rgba(59,130,246,0.18),0_12px_28px_rgba(30,64,175,0.35)]" />
      </div>
    </div>
  );
}

function TaskCard({ submitted }: { submitted: boolean }) {
  if (submitted) {
    return <SuccessBlock title="Nice work." copy="$18 pending. We're checking the photos. This block looks better because you showed up." />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="text-xs font-black uppercase text-[#2d6a4f]">Paid task</div>
        <h4 className="mt-2 text-2xl font-black">Clean loose trash on Oak St.</h4>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
          <span className="rounded-xl bg-[#e7f2e5] p-3">Pays $18</span>
          <span className="rounded-xl bg-[#f3eee1] p-3">25 minutes</span>
          <span className="rounded-xl bg-[#e7f2e5] p-3">Gloves + bags</span>
        </div>
        <p className="mt-4 text-sm text-[#667067]">Funded by DTLA Cleanup Fund.</p>
      </div>
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 text-sm font-black text-red-700"><AlertTriangle size={16} /> Safety</div>
        <ul className="mt-3 space-y-2 text-xs font-bold text-red-900">
          <li>Do not touch needles.</li>
          <li>Do not touch human waste.</li>
          <li>Do not touch chemicals.</li>
          <li>Do not confront anyone.</li>
          <li>Do not enter private property.</li>
        </ul>
      </div>
    </div>
  );
}

function EarningsCard() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h4 className="text-xl font-black">Earnings</h4>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {['Available $24', 'Pending $18', 'Paid $1,040', 'Lifetime earned $1,082'].map((item) => (
          <div key={item} className="rounded-2xl bg-[#eef4eb] p-4 text-sm font-black">{item}</div>
        ))}
      </div>
    </div>
  );
}

function ImpactCard() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h4 className="text-xl font-black">Impact</h4>
      <div className="mt-5 space-y-3">
        {['38 tasks completed', '8 blocks improved', '74 bags removed', '$1,082 earned', 'Broadway Block Reset: 42% complete'].map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm font-bold"><Check className="text-[#2d6a4f]" size={17} /> {item}</div>
        ))}
      </div>
    </div>
  );
}

function SuccessBlock({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-3xl bg-[#174631] p-6 text-white">
      <Check size={28} />
      <h4 className="mt-6 text-2xl font-black">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-[#d7ead9]">{copy}</p>
    </div>
  );
}

function WorkerExplainer({ step, onSubmitReport, onSubmitTask }: { step: number; onSubmitReport: () => void; onSubmitTask: () => void }) {
  const blocks = [
    ['Today', 'The worker lands on a short list of useful work nearby: tasks, reports, training, and campaigns.'],
    ['Map', 'The map shows nearby tasks, reports, campaigns, completed work, and current location.'],
    ['Report Something', 'Take a photo, confirm location, choose a category, add a note, and submit.'],
    ['Task Detail', 'Accept the task, start within 30 minutes, check in with GPS, take before and after photos, complete the checklist, and submit proof.'],
    ['Earnings', 'Workers see available, pending, paid, and lifetime earned.'],
    ['Impact', 'The app shows tasks completed, blocks improved, bags removed, money earned, and campaign progress.'],
  ];
  const [title, copy] = blocks[step];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
      <h3 className="text-2xl font-black">{title}</h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c6d3c5]">{copy}</p>
      {step === 2 && <button onClick={onSubmitReport} className="mt-6 rounded-full bg-[#f0c66a] px-5 py-3 text-sm font-black text-[#07110d]">Submit report</button>}
      {step === 3 && <button onClick={onSubmitTask} className="mt-6 rounded-full bg-[#f0c66a] px-5 py-3 text-sm font-black text-[#07110d]">Submit proof</button>}
    </div>
  );
}

function AdminMap({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('rounded-[2rem] border border-white/10 bg-[#0d1712] p-5 shadow-2xl', compact && 'p-3')}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white">Los Angeles Map</h3>
          <p className="text-xs text-[#9fb0a2]">Neighborhood progress and task flow</p>
        </div>
        <span className="rounded-full bg-[#f0c66a] px-3 py-1 text-xs font-black text-[#07110d]">Live</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {neighborhoods.map(([name, state, level, reports, tasks, paid]) => (
          <div key={name} className={cn('min-h-28 rounded-2xl border p-3', state === 'Needs Care' ? 'border-red-400/40 bg-red-500/10' : state === 'Fully Stewarded' ? 'border-emerald-200/30 bg-emerald-100/10' : 'border-emerald-400/20 bg-white/[0.04]')}>
            <div className="text-xs font-black text-white">{name}</div>
            <div className="mt-1 text-[10px] font-bold text-[#f0c66a]">{state}</div>
            <div className="mt-4 space-y-1 text-[10px] text-[#c6d3c5]">
              <div>{level}</div>
              <div>{reports}</div>
              <div>{tasks}</div>
              <div>{paid}</div>
            </div>
          </div>
        ))}
      </div>
      {!compact && (
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {['New reports 23', 'Tasks needing review 4', 'Open funded tasks 34', 'Payments pending $847', 'Safety flags 3', 'Campaign budgets $18k', 'Tasks in progress 11', 'Funding needed $8k'].map((item) => (
            <div key={item} className="rounded-2xl bg-white/[0.05] p-4 text-sm font-black text-white">{item}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminQueue() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
      <h3 className="text-2xl font-black">New Reports Queue</h3>
      <div className="mt-4 grid gap-3">
        {['Overflowing bin - Low duplicate score', 'Dry planter - Suggested greening task', 'Sharps near planter - Safety flag'].map((item, index) => (
          <div key={item} className="grid grid-cols-[74px_1fr] gap-3 rounded-2xl bg-black/20 p-3">
            <div className="flex h-16 items-center justify-center rounded-xl bg-white/10 text-xs font-bold text-[#9fb0a2]">Photo</div>
            <div>
              <div className="text-sm font-black">{item}</div>
              <p className="mt-1 text-xs leading-5 text-[#c6d3c5]">{index === 2 ? 'Route to city or professional-only.' : 'Approve as task, needs funding, duplicate, reject, or needs permission.'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTaskBuilder() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5">
      <h3 className="text-2xl font-black">Create Task</h3>
      <div className="mt-4 grid gap-2 text-sm text-[#c6d3c5] sm:grid-cols-2">
        {['Task title', 'Location', 'Map boundary', 'Worker payout: $18', 'Total budget: $30', 'Estimated time: 25m', 'Required tools', 'Safety tier', 'Proof required', 'Deadline', 'Funding source', 'Campaign'].map((item) => (
          <div key={item} className="rounded-xl bg-black/20 px-3 py-2">{item}</div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-[#f0c66a]/30 bg-[#f0c66a]/10 p-4 text-sm font-bold text-[#f0c66a]">
        A task cannot go live unless it is funded.
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {taskStates.map((state) => <span key={state} className="rounded-full bg-white/8 px-3 py-1 text-[10px] font-bold text-[#c6d3c5]">{state}</span>)}
      </div>
    </div>
  );
}

function SponsorCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('rounded-[2rem] border border-[#f0c66a]/20 bg-[#101914] p-6 text-white shadow-2xl', compact && 'p-5')}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0c66a] text-[#07110d]"><Flag size={22} /></div>
        <div>
          <h3 className="text-2xl font-black">Sponsor a block.</h3>
          <p className="text-sm text-[#c6d3c5]">Pick an area. Set a budget. See verified results.</p>
        </div>
      </div>
      <div className="mt-6 rounded-3xl bg-white/[0.06] p-5">
        <div className="text-xs font-black uppercase tracking-wider text-[#f0c66a]">Example campaign</div>
        <h4 className="mt-2 text-3xl font-black">Broadway Block Reset</h4>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[42%] rounded-full bg-[#f0c66a]" />
        </div>
        <div className="mt-3 text-sm font-bold text-[#c6d3c5]">42% complete</div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {['Budget $10,000', '$4,200 paid to workers', '128 tasks completed', '18 blocks improved'].map((item) => (
          <div key={item} className="rounded-2xl bg-white/[0.06] p-4 text-sm font-black">{item}</div>
        ))}
      </div>
    </div>
  );
}

function SponsorResults() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6">
      <h3 className="text-3xl font-black">Verified results</h3>
      <p className="mt-3 text-sm leading-7 text-[#c6d3c5]">Sponsors see before and after photos, worker payout totals, tasks completed, and neighborhood progress. The point is not charity. It is a budget turning into visible work.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {['Before photo', 'After photo'].map((label) => (
          <div key={label} className="relative h-64 overflow-hidden rounded-3xl bg-[#253129]">
            <Image src={label === 'Before photo' ? '/task_thumbnail.png' : '/volunteers_working.png'} alt={label} fill className="object-cover" />
            <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-black">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-3xl bg-[#f0c66a] p-5 text-[#07110d]">
        <div className="text-sm font-black">Neighborhood progress updates when work is approved.</div>
      </div>
    </div>
  );
}
