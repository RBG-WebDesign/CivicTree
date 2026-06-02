import Image from 'next/image';
import Link from 'next/link';
import CivicTreeLogo from '@/components/CivicTreeLogo';
import {
  ArrowRight,
  Building2,
  Camera,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Flag,
  Leaf,
  MapPin,
  ShieldCheck,
  TreePine,
  Users,
  type LucideIcon,
} from 'lucide-react';

const impactStats = [
  ['$42,800+', 'paid to residents', CircleDollarSign],
  ['1,240', 'tasks completed', ClipboardCheck],
  ['850', 'active neighbors', Users],
] as const;

const steps = [
  ['Find a task', 'Browse verified cleanup, planting, reporting, and care work near your block.', MapPin],
  ['Complete the work', 'Follow the task checklist, stay inside the safety rules, and capture proof as you go.', ClipboardCheck],
  ['Submit proof', 'Upload before and after photos so CivicTree can verify the work and update the block.', Camera],
  ['Get paid', 'Approved work moves into earnings, with a clear history of your civic impact.', CircleDollarSign],
] as const;

const taskCards = [
  ['Graffiti removal', 'Madison Ave underpass', '$15', 'Verified', ShieldCheck],
  ['Tree pit mulching', 'Downtown 4th Street', '$12', 'Urgent', TreePine],
  ['Planter refresh', 'Culver Blvd', '$18', 'Beginner', Leaf],
] as const;

const partnerBands = [
  ['Culver City Dept of Works', 'City-ready review flows'],
  ['Urban Forestry Div.', 'Recurring green-space care'],
  ['Neighborhood Council', 'Block-by-block priorities'],
  ['Green Culver Alliance', 'Sponsor-funded campaigns'],
] as const;

function MetricCard({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e4f3e8] text-[#1b4332]">
        <Icon size={24} strokeWidth={2.4} />
      </div>
      <div>
        <div className="text-2xl font-black leading-none text-[#143224]">{value}</div>
        <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#66756a]">{label}</div>
      </div>
    </div>
  );
}

function StepCard({
  index,
  title,
  copy,
  icon: Icon,
}: {
  index: number;
  title: string;
  copy: string;
  icon: LucideIcon;
}) {
  return (
    <div className="group rounded-lg border border-[#dfe7dc] bg-white p-6 shadow-[0_18px_46px_rgba(27,67,50,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(27,67,50,0.12)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#173d2d] text-white">
          <Icon size={22} strokeWidth={2.4} />
        </div>
        <span className="text-sm font-black text-[#a4b2a7]">0{index + 1}</span>
      </div>
      <h3 className="mt-6 text-2xl font-black text-[#142219]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#56645b]">{copy}</p>
    </div>
  );
}

function TaskMiniCard({
  title,
  location,
  payout,
  status,
  icon: Icon,
}: {
  title: string;
  location: string;
  payout: string;
  status: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href="/worker/map"
      className="group flex min-h-[212px] flex-col justify-between rounded-lg border border-[#dfe7dc] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(19,48,36,0.12)]"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e6f4ea] text-[#1b4332]">
            <Icon size={21} />
          </div>
          <span className="rounded-md bg-[#f1f7f2] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#2d6a4f]">
            {status}
          </span>
        </div>
        <h3 className="mt-6 text-xl font-black text-[#142219]">{title}</h3>
        <p className="mt-2 text-sm font-semibold text-[#657168]">{location}</p>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-[#e4e9e1] pt-4">
        <span className="text-lg font-black text-[#1b4332]">{payout}</span>
        <ArrowRight className="text-[#8a998d] transition group-hover:translate-x-1 group-hover:text-[#1b4332]" size={18} />
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9f4] text-[#142219]">
      <header className="sticky top-0 z-40 border-b border-[#dfe6dc]/80 bg-[#f8f9f4]/88 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 md:px-10">
          <Link href="/" aria-label="CivicTree home" className="shrink-0">
            <CivicTreeLogo size="md" />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-black text-[#3d4d43] md:flex">
            <Link href="/how-it-works" className="transition hover:text-[#1b4332]">How it works</Link>
            <Link href="/earn" className="transition hover:text-[#1b4332]">Earn</Link>
            <Link href="/for-cities" className="transition hover:text-[#1b4332]">For Cities</Link>
            <Link href="/sponsor" className="transition hover:text-[#1b4332]">Sponsor</Link>
            <Link href="/pitch" className="transition hover:text-[#1b4332]">Demo</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-full border border-[#d9e1d7] bg-white px-4 py-2 text-sm font-black text-[#142219] shadow-sm transition hover:bg-[#f1f5ef]"
            >
              Sign in
            </Link>
            <Link
              href="/worker/today"
              className="hidden rounded-full bg-[#173d2d] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(27,67,50,0.18)] transition hover:bg-[#102b20] sm:inline-flex"
            >
              Go to app
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(232,244,234,0.34)_54%,rgba(248,249,244,0)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(27,67,50,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(27,67,50,0.05)_1px,transparent_1px)] [background-size:46px_46px]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-28 pt-14 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pb-32 lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe2d2] bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#2d6a4f] shadow-sm">
              <Leaf size={15} />
              Paid civic work
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-[#10281d] md:text-7xl">
              Get paid to improve your neighborhood.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#46564c] md:text-xl">
              CivicTree turns local cleanup, planting, reporting, and repair into verified paid tasks. Find nearby work, help your block look better, and build a visible record of impact.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/worker/map"
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#1b4332] px-7 py-4 text-base font-black text-white shadow-[0_18px_42px_rgba(27,67,50,0.24)] transition hover:-translate-y-0.5 hover:bg-[#102b20]"
              >
                Find tasks near me
                <ArrowRight size={19} />
              </Link>
              <Link
                href="/sponsor"
                className="inline-flex items-center justify-center gap-3 rounded-lg border border-[#1b4332]/18 bg-white px-7 py-4 text-base font-black text-[#1b4332] shadow-[0_14px_30px_rgba(19,48,36,0.08)] transition hover:-translate-y-0.5 hover:bg-[#f1f6ef]"
              >
                <Building2 size={19} />
                Sponsor a block
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[#405247]">
              {['No fees to join', 'Safety rules built in', 'Proof-based payouts'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check size={17} className="text-[#2d6a4f]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-[#cfe7d2] opacity-70 blur-2xl" />
            <div className="relative rotate-1 overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_34px_90px_rgba(27,67,50,0.16)] transition duration-500 hover:rotate-0">
              <div className="relative h-[360px] md:h-[520px]">
                <Image
                  src="/volunteers_working.png"
                  alt="CivicTree neighbors improving a block together"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 720px, 100vw"
                  priority
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#10281d]/75 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#d7f2d9]">Broadway Block Reset</div>
                    <div className="mt-2 text-3xl font-black">$4,200 paid</div>
                  </div>
                  <div className="rounded-lg bg-white/92 px-4 py-3 text-[#10281d] shadow-lg">
                    <div className="text-xs font-black uppercase tracking-[0.12em] text-[#2d6a4f]">42% complete</div>
                    <div className="mt-1 text-sm font-black">128 verified tasks</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-7 left-5 flex items-center gap-3 rounded-lg border border-[#dfe7dc] bg-white p-4 shadow-[0_20px_55px_rgba(19,48,36,0.16)] md:-left-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e4f3e8] text-[#1b4332]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-sm font-black text-[#10281d]">Task verified</div>
                <div className="mt-1 text-xs font-semibold text-[#66756a]">Tree care submitted near Madison Ave</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-5 md:px-10">
        <div className="grid overflow-hidden rounded-lg border border-[#dfe7dc] bg-white shadow-[0_26px_70px_rgba(27,67,50,0.1)] md:grid-cols-3">
          {impactStats.map(([value, label, Icon], index) => (
            <div key={label} className={index > 0 ? 'border-t border-[#e4e9e1] md:border-l md:border-t-0' : ''}>
              <MetricCard value={value} label={label} icon={Icon} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#2d6a4f]">How CivicTree works</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-[#10281d] md:text-5xl">
            A simple loop for safer, cleaner blocks.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, copy, Icon], index) => (
            <StepCard key={title} index={index} title={title} copy={copy} icon={Icon} />
          ))}
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#2d6a4f]">Available nearby</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-[#10281d] md:text-5xl">Real tasks waiting for neighbors.</h2>
            </div>
            <Link href="/worker/map" className="inline-flex items-center gap-2 text-sm font-black text-[#1b4332] hover:underline">
              View task map
              <MapPin size={18} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Link
              href="/worker/map"
              className="group relative min-h-[460px] overflow-hidden rounded-lg border border-[#dfe7dc] bg-[#10281d] shadow-[0_26px_70px_rgba(16,40,29,0.14)]"
            >
              <Image
                src="/task_thumbnail.png"
                alt="A CivicTree cleanup task ready to claim"
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(min-width: 1024px) 720px, 100vw"
                loading="eager"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07130e]/88 via-[#07130e]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <span className="rounded-full bg-[#2d6a4f] px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                  High impact
                </span>
                <h3 className="mt-5 max-w-xl text-3xl font-black tracking-tight md:text-4xl">Plaza main street cleanup</h3>
                <p className="mt-3 max-w-xl text-base leading-7 text-white/82">
                  Support local businesses by keeping a public route clear, safe, and ready for foot traffic.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="text-2xl font-black">$45.00</span>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-black text-[#10281d]">
                    Join task
                    <ArrowRight size={17} />
                  </span>
                </div>
              </div>
            </Link>

            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
                {taskCards.map(([title, location, payout, status, Icon]) => (
                  <TaskMiniCard key={title} title={title} location={location} payout={payout} status={status} icon={Icon} />
                ))}
              </div>
              <Link
                href="/sponsor"
                className="flex flex-col justify-between gap-6 rounded-lg bg-[#173d2d] p-6 text-white shadow-[0_20px_55px_rgba(23,61,45,0.18)] sm:flex-row sm:items-center"
              >
                <div>
                  <Flag size={25} className="text-[#bce7c6]" />
                  <h3 className="mt-4 text-2xl font-black">Become a block sponsor</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#cae4d1]">
                    Fund recurring neighborhood work and see verified proof as tasks are approved.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b7f1c7] px-5 py-3 text-sm font-black text-[#10281d]">
                  Learn more
                  <ArrowRight size={17} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dfe7dc] bg-[#edf4ed] py-16">
        <div className="mx-auto max-w-7xl px-5 text-center md:px-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#6d7d71]">Built for city partners and local sponsors</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partnerBands.map(([name, copy]) => (
              <Link
                key={name}
                href={name.includes('Dept') || name.includes('Forestry') ? '/for-cities' : '/sponsor'}
                className="rounded-lg border border-[#d5dfd3] bg-white/72 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:bg-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b4332] text-white">
                  <Building2 size={18} />
                </div>
                <h3 className="mt-4 text-base font-black text-[#10281d]">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5b695f]">{copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#10281d] px-5 py-24 text-white md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#b7f1c7]">Ready when your block is</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Turn neighborhood care into visible work.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#d4e4d7]">
              Start with onboarding, browse open tasks, or launch the guided pitch to see the full CivicTree demo path.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/worker/onboarding" className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#b7f1c7] px-6 py-4 text-sm font-black text-[#10281d]">
                Start onboarding
                <ArrowRight size={18} />
              </Link>
              <Link href="/worker/map" className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/18 px-6 py-4 text-sm font-black text-white hover:bg-white/8">
                Open task map
                <MapPin size={18} />
              </Link>
              <Link href="/pitch" className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/18 px-6 py-4 text-sm font-black text-white hover:bg-white/8">
                Watch demo
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative h-72 overflow-hidden rounded-lg border border-white/12">
              <Image src="/demo-alley-before.png" alt="Before CivicTree task work" fill className="object-cover" sizes="(min-width: 1024px) 320px, 50vw" loading="eager" unoptimized />
              <div className="absolute bottom-4 left-4 rounded-full bg-black/62 px-3 py-1 text-xs font-black">Before</div>
            </div>
            <div className="relative h-72 overflow-hidden rounded-lg border border-white/12">
              <Image src="/demo-alley-after.png" alt="After CivicTree task work" fill className="object-cover" sizes="(min-width: 1024px) 320px, 50vw" loading="eager" unoptimized />
              <div className="absolute bottom-4 left-4 rounded-full bg-black/62 px-3 py-1 text-xs font-black">After</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
