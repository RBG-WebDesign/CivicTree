'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import CivicTreeLogo from '@/components/CivicTreeLogo';
import { useHydrated } from '@/lib/demo/hooks';
import { PLACEHOLDER_TASK_IMAGE } from '@/lib/demo/constants';
import { campaignProgress, filterTasks, taskDistanceMiles, workerBalances } from '@/lib/demo/selectors';
import { useDemoStore } from '@/lib/demo/store';
import type { Payment, Task } from '@/lib/demo/types';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Camera,
  Clock3,
  DollarSign,
  ExternalLink,
  FileText,
  Gauge,
  Layers,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCircle,
  WalletCards,
} from 'lucide-react';

type DesktopTab = 'today' | 'map' | 'report' | 'earn' | 'profile';

const tabs: Array<{ id: DesktopTab; label: string; icon: typeof Map }> = [
  { id: 'today', label: 'Today', icon: Activity },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'report', label: 'Report', icon: Plus },
  { id: 'earn', label: 'Earn', icon: WalletCards },
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

const reportCategories = [
  'Trash',
  'Graffiti',
  'Broken bench',
  'Dirty sidewalk',
  'Dead planter',
  'Illegal dumping',
  'Blocked sidewalk',
  'Other',
];

function pinColor(task: Task) {
  if (task.status === 'claimed' || task.status === 'in_progress') return '#d9892f';
  if (task.status === 'submitted') return '#2563eb';
  if (task.status === 'approved') return '#15803d';
  if (task.status === 'rejected') return '#b91c1c';
  return '#197243';
}

function getCoordinates(task: Task) {
  const latMin = 34.0425;
  const latMax = 34.0465;
  const lngMin = -118.253;
  const lngMax = -118.2475;
  const x = ((task.location.lng - lngMin) / (lngMax - lngMin)) * 100;
  const y = (1 - (task.location.lat - latMin) / (latMax - latMin)) * 100;
  return {
    x: Math.min(Math.max(x, 8), 92),
    y: Math.min(Math.max(y, 12), 86),
  };
}

function statusLabel(task: Task) {
  if (task.status === 'in_progress') return 'In progress';
  if (task.status === 'submitted') return 'In review';
  if (task.status === 'approved') return 'Approved';
  if (task.status === 'claimed') return 'Claimed';
  if (task.isFundingNeeded) return 'Needs funding';
  if (task.isComingSoon) return 'Coming soon';
  return 'Open';
}

function taskTypeLabel(task: Task) {
  if (task.taskType === 'planter') return 'Maintenance';
  if (task.taskType === 'painting') return 'Painting';
  if (task.taskType === 'verify') return 'Verify';
  return 'Cleanup';
}

function paymentLabel(payment: Payment) {
  if (payment.status === 'pending_review') return 'Checking proof';
  if (payment.status === 'available') return 'Available';
  if (payment.status === 'paid') return 'Paid';
  return 'Rejected';
}

export default function WorkerDesktopPage() {
  const hydrated = useHydrated();
  const store = useDemoStore();
  const {
    activePersona,
    campaigns,
    claims,
    createReport,
    payments,
    reports,
    submissions,
    tasks,
    workers,
    claimTask,
  } = store;
  const workerId = activePersona.userId;
  const worker = workers.find((item) => item.id === workerId) ?? workers[0];
  const [activeTab, setActiveTab] = useState<DesktopTab>('today');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState('all');
  const [reportCategory, setReportCategory] = useState(reportCategories[0]);
  const [reportNote, setReportNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const visibleTasks = useMemo(() => filterTasks(tasks, taskFilter), [tasks, taskFilter]);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? visibleTasks[0] ?? tasks[0];
  const workerClaims = claims.filter((claim) => claim.workerId === workerId);
  const activeClaim = workerClaims.find((claim) => claim.status === 'claimed' || claim.status === 'in_progress');
  const activeTask = activeClaim ? tasks.find((task) => task.id === activeClaim.taskId) : undefined;
  const workerPayments = payments.filter((payment) => payment.workerId === workerId);
  const workerSubmissions = submissions.filter((submission) => submission.workerId === workerId);
  const balances = workerBalances(store, workerId);
  const campaign = campaigns.find((item) => item.id === 'campaign-broadway');
  const campaignPct = campaign ? campaignProgress(store, campaign.id) : 0;
  const openPaidTasks = tasks.filter((task) => task.status === 'open' && !task.isComingSoon && !task.isFundingNeeded);
  const openValue = openPaidTasks.reduce((sum, task) => sum + task.payoutAmount, 0);
  const pendingReports = reports.filter((report) => report.status === 'pending').length;

  function handleClaimTask(task: Task) {
    if (task.status !== 'open' || task.isFundingNeeded || task.isComingSoon) return;
    claimTask(task.id, workerId);
    setSelectedTaskId(task.id);
    setActiveTab('today');
  }

  function handleSubmitReport(event: React.FormEvent) {
    event.preventDefault();
    if (!reportNote.trim()) return;
    createReport({
      userId: workerId,
      category: reportCategory.toLowerCase().replaceAll(' ', '_'),
      note: reportNote.trim(),
      location: { lat: 34.0456, lng: -118.2505 },
      photoUrl: PLACEHOLDER_TASK_IMAGE,
    });
    setReportNote('');
    setReportSuccess(true);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef2ec]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#197243] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2ec] text-[#101814]">
      <header className="sticky top-[38px] z-40 border-b border-[#dfe6dc] bg-[#f8faf6]/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="CivicTree home" className="inline-flex">
              <CivicTreeLogo size="md" />
            </Link>
            <div className="hidden h-8 w-px bg-[#d6ddd3] lg:block" />
            <div className="hidden lg:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Worker Desktop</p>
              <p className="text-sm font-bold text-[#536056]">Same account, same task state, wider view.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/worker/today" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d8e0d5] bg-white px-4 text-xs font-black text-[#197243] shadow-sm">
              <Navigation size={15} />
              Open mobile app
            </Link>
            <Link href="/worker/map" className="hidden h-10 items-center gap-2 rounded-xl border border-[#d8e0d5] bg-white px-4 text-xs font-black text-[#101814] shadow-sm md:inline-flex">
              <Map size={15} />
              Mobile map
            </Link>
            <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e0d5] bg-white shadow-sm">
              <Bell size={17} />
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#197243]" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 xl:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-[#dfe6dc] bg-[#10251b] p-4 text-white shadow-sm xl:sticky xl:top-[118px] xl:h-[calc(100vh-142px)]">
          <div className="rounded-xl border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dff5e6] text-lg font-black text-[#123421]">
                {worker?.name.slice(0, 1) ?? 'A'}
              </div>
              <div>
                <p className="font-black">{worker?.name ?? 'Austin'}</p>
                <p className="text-xs font-semibold text-emerald-100/70">Historic Core steward</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat label="Available" value={`$${balances.available.toFixed(0)}`} />
              <MiniStat label="Pending" value={`$${balances.pending.toFixed(0)}`} />
            </div>
          </div>

          <nav className="mt-5 grid gap-1.5">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-black transition ${
                  activeTab === id ? 'bg-[#dff5e6] text-[#123421]' : 'text-emerald-100/70 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/6 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Live sync</p>
            <p className="mt-2 text-xs leading-relaxed text-emerald-100/70">
              Claims, reports, proof status, and payouts update the same store used by the phone workflow.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          {activeTab === 'today' && (
            <TodayPanel
              activeTask={activeTask}
              balances={balances}
              campaignPct={campaignPct}
              openPaidTasks={openPaidTasks}
              openValue={openValue}
              pendingReports={pendingReports}
              setActiveTab={setActiveTab}
              workerName={worker?.name ?? 'Austin'}
            />
          )}

          {activeTab === 'map' && (
              <MapPanel
                handleClaimTask={handleClaimTask}
                selectedTask={selectedTask}
                setSelectedTaskId={setSelectedTaskId}
                setTaskFilter={setTaskFilter}
                taskFilter={taskFilter}
              tasks={visibleTasks}
            />
          )}

          {activeTab === 'report' && (
            <ReportPanel
              handleSubmitReport={handleSubmitReport}
              reportCategory={reportCategory}
              reportNote={reportNote}
              reportSuccess={reportSuccess}
              setReportCategory={setReportCategory}
              setReportNote={setReportNote}
              setReportSuccess={setReportSuccess}
            />
          )}

          {activeTab === 'earn' && (
            <EarnPanel
              balances={balances}
              payments={workerPayments}
              submissions={workerSubmissions}
              tasks={tasks}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePanel
              balances={balances}
              submissions={workerSubmissions}
              worker={worker}
            />
          )}
        </section>
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/12 p-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-emerald-100/50">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function TodayPanel({
  activeTask,
  balances,
  campaignPct,
  openPaidTasks,
  openValue,
  pendingReports,
  setActiveTab,
  workerName,
}: {
  activeTask: Task | undefined;
  balances: ReturnType<typeof workerBalances>;
  campaignPct: number;
  openPaidTasks: Task[];
  openValue: number;
  pendingReports: number;
  setActiveTab: (tab: DesktopTab) => void;
  workerName: string;
}) {
  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-2xl border border-[#dfe6dc] bg-[#143421] text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Today</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Good morning, {workerName}.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100/75">
              Plan on desktop, do the field work on mobile. Your claim, proof, review, and payout state stays connected.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setActiveTab('map')} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#dff5e6] px-5 text-sm font-black text-[#123421]">
                <Map size={17} />
                Open desktop map
              </button>
              <Link href="/worker/today" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-black text-white">
                <ExternalLink size={17} />
                Switch to phone app
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <DashboardMetric label="Available balance" value={`$${balances.available.toFixed(2)}`} icon={DollarSign} />
            <DashboardMetric label="Pending review" value={`$${balances.pending.toFixed(2)}`} icon={Clock3} />
            <DashboardMetric label="Open paid work" value={`$${openValue.toFixed(0)}`} icon={BriefcaseBusiness} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Next step</p>
              <h2 className="mt-2 text-2xl font-black">{activeTask ? 'Finish your active task' : 'Pick your route'}</h2>
            </div>
            <Gauge className="text-[#197243]" size={24} />
          </div>
          {activeTask ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700">{statusLabel(activeTask)}</p>
              <h3 className="mt-2 text-xl font-black">{activeTask.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#59635c]">{activeTask.description}</p>
              <Link href={`/worker/task/${activeTask.id}/active`} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#143421] px-4 text-sm font-black text-white">
                Continue in mobile flow
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {openPaidTasks.slice(0, 4).map((task) => (
                <button key={task.id} type="button" onClick={() => setActiveTab('map')} className="flex items-center justify-between rounded-2xl border border-[#e2e8df] bg-[#fbfcfa] p-4 text-left">
                  <span>
                    <span className="block text-sm font-black">{task.title}</span>
                    <span className="mt-1 block text-xs font-semibold text-[#647067]">{task.estimatedMinutes} min, {taskDistanceMiles(task).toFixed(1)} mi away</span>
                  </span>
                  <span className="text-lg font-black text-[#197243]">${task.payoutAmount}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-6">
          <div className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Broadway Block Reset</p>
                <h2 className="mt-2 text-xl font-black">{campaignPct}% complete</h2>
              </div>
              <Sparkles className="text-[#197243]" />
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e8eee6]">
              <div className="h-full rounded-full bg-[#197243]" style={{ width: `${campaignPct}%` }} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="Reports waiting" value={pendingReports.toString()} copy="Can become paid verification tasks." icon={FileText} />
            <InfoCard label="Tasks nearby" value={openPaidTasks.length.toString()} copy="Open paid jobs near your current zone." icon={MapPin} />
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardMetric({ icon: Icon, label, value }: { icon: typeof Map; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/55">{label}</p>
        <Icon size={17} className="text-emerald-200" />
      </div>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function InfoCard({ copy, icon: Icon, label, value }: { copy: string; icon: typeof Map; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#dfe6dc] bg-white p-5 shadow-sm">
      <Icon size={20} className="text-[#197243]" />
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-black">{label}</p>
      <p className="mt-2 text-xs leading-5 text-[#647067]">{copy}</p>
    </div>
  );
}

function MapPanel({
  handleClaimTask,
  selectedTask,
  setSelectedTaskId,
  setTaskFilter,
  taskFilter,
  tasks,
}: {
  handleClaimTask: (task: Task) => void;
  selectedTask: Task | undefined;
  setSelectedTaskId: (id: string) => void;
  setTaskFilter: (filter: string) => void;
  taskFilter: string;
  tasks: Task[];
}) {
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Map</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Plan the route before field work</h1>
            <p className="mt-2 text-sm text-[#647067]">Claim here, then continue the proof flow in the mobile app.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['all', 'Open'],
              ['quick', 'Quick'],
              ['highest_pay', 'High pay'],
              ['verify', 'Verify'],
              ['funding', 'Needs funding'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTaskFilter(id)}
                className={`rounded-xl border px-4 py-2 text-xs font-black ${taskFilter === id ? 'border-[#197243] bg-[#197243] text-white' : 'border-[#dfe6dc] bg-white text-[#526057]'}`}
              >
                {label}
              </button>
            ))}
            <button type="button" className="rounded-xl border border-[#dfe6dc] bg-white px-4 py-2 text-xs font-black text-[#526057]">
              <SlidersHorizontal size={14} className="mr-1 inline" />
              Filters
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="overflow-hidden rounded-2xl border border-[#dfe6dc] bg-white shadow-sm">
          <div className="relative h-[560px] bg-[#e9ede6]">
            <div className="absolute inset-0 desktop-map-texture" />
            <MapGridLabel className="left-[10%] top-[12%]" label="Spring St" />
            <MapGridLabel className="left-[44%] top-[18%]" label="Broadway" />
            <MapGridLabel className="right-[16%] top-[38%]" label="Historic Core" large />
            <div className="absolute left-[48%] top-[48%] flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500/10">
              <span className="h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-lg" />
            </div>
            {tasks.slice(0, 12).map((task) => {
              const coords = getCoordinates(task);
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`absolute flex h-12 min-w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full rounded-bl-sm px-2 text-sm font-black text-white shadow-lg transition hover:scale-105 ${selectedTask?.id === task.id ? 'z-20 scale-110 ring-4 ring-white/50' : ''}`}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%`, backgroundColor: pinColor(task) }}
                >
                  ${Math.round(task.payoutAmount)}
                </button>
              );
            })}
            <button type="button" className="absolute right-5 top-5 flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black shadow-sm">
              <LocateFixed size={15} />
              Center
            </button>
          </div>
        </div>

        <aside className="grid gap-4">
          {selectedTask && (
            <div className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">{statusLabel(selectedTask)}</p>
                  <h2 className="mt-2 text-2xl font-black">{selectedTask.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#647067]">{selectedTask.description}</p>
                </div>
                <span className="text-3xl font-black text-[#197243]">${selectedTask.payoutAmount}</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <SmallMetric label="Distance" value={`${taskDistanceMiles(selectedTask).toFixed(1)} mi`} />
                <SmallMetric label="Time" value={`${selectedTask.estimatedMinutes}m`} />
                <SmallMetric label="Type" value={taskTypeLabel(selectedTask)} />
              </div>
              <div className="mt-5 rounded-xl border border-[#e3eae0] bg-[#fbfcfa] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#647067]">Proof required</p>
                <p className="mt-2 text-sm font-bold">GPS check-in, same-angle photos, checklist, AI score, admin review.</p>
              </div>
              {selectedTask.status === 'open' && !selectedTask.isFundingNeeded && !selectedTask.isComingSoon ? (
                <button type="button" onClick={() => handleClaimTask(selectedTask)} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#197243] text-sm font-black text-white">
                  <BriefcaseBusiness size={17} />
                  Claim from desktop
                </button>
              ) : (
                <Link href={`/worker/task/${selectedTask.id}/active`} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#143421] text-sm font-black text-white">
                  Continue in mobile workflow
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-[#dfe6dc] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-[#647067]">Task list</p>
              <Search size={16} className="text-[#647067]" />
            </div>
            <div className="grid gap-2">
              {tasks.slice(0, 6).map((task) => (
                <button key={task.id} type="button" onClick={() => setSelectedTaskId(task.id)} className="flex items-center justify-between rounded-xl border border-[#edf1ea] bg-[#fbfcfa] p-3 text-left">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-black">{task.title}</span>
                    <span className="mt-1 block text-[10px] font-semibold text-[#647067]">{statusLabel(task)} · {taskDistanceMiles(task).toFixed(1)} mi</span>
                  </span>
                  <span className="text-sm font-black text-[#197243]">${task.payoutAmount}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function MapGridLabel({ className, label, large = false }: { className: string; label: string; large?: boolean }) {
  return (
    <span className={`absolute select-none font-black text-[#8a928b]/70 ${large ? 'text-xl tracking-wide' : 'text-sm'} ${className}`}>
      {label}
    </span>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e3eae0] bg-[#fbfcfa] p-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-[#647067]">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function ReportPanel({
  handleSubmitReport,
  reportCategory,
  reportNote,
  reportSuccess,
  setReportCategory,
  setReportNote,
  setReportSuccess,
}: {
  handleSubmitReport: (event: React.FormEvent) => void;
  reportCategory: string;
  reportNote: string;
  reportSuccess: boolean;
  setReportCategory: (category: string) => void;
  setReportNote: (note: string) => void;
  setReportSuccess: (success: boolean) => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Report</p>
        <h1 className="mt-2 text-3xl font-black">Turn issues into paid work</h1>
        <p className="mt-3 text-sm leading-7 text-[#647067]">
          Desktop report intake helps a worker or dispatcher create better reports. Mobile still handles field photos and GPS.
        </p>

        {reportSuccess && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-[#143421]">
            Report submitted. It now appears in the shared demo store for worker and admin views.
            <button type="button" onClick={() => setReportSuccess(false)} className="ml-3 text-[#197243] underline">Add another</button>
          </div>
        )}

        <form onSubmit={handleSubmitReport} className="mt-6 grid gap-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-[#647067]">Category</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {reportCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setReportCategory(category)}
                  className={`rounded-xl border px-3 py-3 text-xs font-black ${reportCategory === category ? 'border-[#197243] bg-[#e7f5e9] text-[#143421]' : 'border-[#dfe6dc] bg-white text-[#526057]'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="desktop-report-note" className="text-[10px] font-black uppercase tracking-widest text-[#647067]">Issue note</label>
            <textarea
              id="desktop-report-note"
              required
              rows={5}
              value={reportNote}
              onChange={(event) => setReportNote(event.target.value)}
              placeholder="Describe the issue, location, and any safety concern."
              className="mt-2 w-full rounded-2xl border border-[#dfe6dc] bg-[#fbfcfa] p-4 text-sm outline-none focus:ring-2 focus:ring-[#197243]/20"
            />
          </div>

          <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#197243] text-sm font-black text-white">
            <Plus size={17} />
            Submit report
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
        <div className="relative h-[420px] overflow-hidden rounded-2xl bg-[#e9ede6]">
          <div className="absolute inset-0 desktop-map-texture" />
          <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500/10">
            <span className="h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-lg" />
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[#dfe6dc] bg-white p-4 shadow-sm">
            <p className="text-xs font-black text-[#143421]">Pinned location</p>
            <p className="mt-1 text-xs text-[#647067]">34.0456, -118.2505, Historic Core</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <InfoCard label="Photo" value="Sim" copy="Uses demo photo proof." icon={Camera} />
          <InfoCard label="GPS" value="OK" copy="Pinned to current work zone." icon={MapPin} />
          <InfoCard label="Routing" value="Admin" copy="Can be promoted into a paid task." icon={Layers} />
        </div>
      </div>
    </section>
  );
}

function EarnPanel({
  balances,
  payments,
  submissions,
  tasks,
}: {
  balances: ReturnType<typeof workerBalances>;
  payments: Payment[];
  submissions: ReturnType<typeof useDemoStore.getState>['submissions'];
  tasks: Task[];
}) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Available" value={`$${balances.available.toFixed(0)}`} copy="Ready to cash out." icon={DollarSign} />
        <InfoCard label="Pending" value={`$${balances.pending.toFixed(0)}`} copy="Waiting on proof review." icon={Clock3} />
        <InfoCard label="Lifetime" value={`$${balances.lifetime.toFixed(0)}`} copy="All approved and pending work." icon={WalletCards} />
      </section>

      <section className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Earn</p>
            <h1 className="mt-2 text-3xl font-black">Payout ledger</h1>
          </div>
          <Link href="/worker/earn" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfe6dc] bg-white px-4 text-xs font-black text-[#197243]">
            Mobile earn page
            <ExternalLink size={14} />
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#e3eae0]">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 bg-[#f7faf5] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#647067]">
            <span>Task</span>
            <span>Status</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
          </div>
          {payments.length === 0 ? (
            <p className="p-8 text-center text-sm font-semibold text-[#647067]">No payouts yet.</p>
          ) : (
            payments.map((payment) => {
              const submission = submissions.find((item) => item.id === payment.submissionId);
              const task = tasks.find((item) => item.id === submission?.taskId);
              return (
                <div key={payment.id} className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 border-t border-[#e3eae0] px-5 py-4 text-sm">
                  <span className="font-black">{task?.title ?? 'Task'}</span>
                  <span className="font-bold text-[#647067]">{paymentLabel(payment)}</span>
                  <span className="text-[#647067]">{new Date(payment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  <span className="text-right font-black text-[#197243]">${payment.amount.toFixed(2)}</span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function ProfilePanel({
  balances,
  submissions,
  worker,
}: {
  balances: ReturnType<typeof workerBalances>;
  submissions: ReturnType<typeof useDemoStore.getState>['submissions'];
  worker: ReturnType<typeof useDemoStore.getState>['workers'][number] | undefined;
}) {
  const approvedCount = submissions.filter((submission) => submission.status === 'approved').length;
  const pendingCount = submissions.filter((submission) => submission.status === 'submitted').length;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#143421] text-3xl font-black text-white">
            {worker?.name.slice(0, 1) ?? 'A'}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Profile</p>
            <h1 className="mt-1 text-3xl font-black">{worker?.name ?? 'Austin'}</h1>
            <p className="mt-1 text-sm font-semibold text-[#647067]">{worker?.neighborhoodId ?? 'downtown'} steward</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <SmallMetric label="Level" value={`${worker?.level ?? 1}`} />
          <SmallMetric label="Lifetime" value={`$${balances.lifetime.toFixed(0)}`} />
          <SmallMetric label="Approved" value={approvedCount.toString()} />
          <SmallMetric label="Pending" value={pendingCount.toString()} />
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Trust metrics</p>
              <h2 className="mt-2 text-2xl font-black">Reliability and safety</h2>
            </div>
            <ShieldCheck className="text-[#197243]" size={28} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <TrustBar label="Reliability" value={worker?.reliabilityScore ?? 98} />
            <TrustBar label="Safety" value={worker?.safetyScore ?? 99} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#dfe6dc] bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#197243]">Unlocked work</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(worker?.unlockedTaskTypes ?? ['cleanup']).map((type) => (
              <span key={type} className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f5e9] px-3 py-1.5 text-xs font-black text-[#143421]">
                <BadgeCheck size={13} />
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e3eae0] bg-[#fbfcfa] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black">{label}</p>
        <p className="text-lg font-black text-[#197243]">{Math.round(value)}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e3eae0]">
        <div className="h-full rounded-full bg-[#197243]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
