'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import CivicTreeLogo from '@/components/CivicTreeLogo';
import WorkerNav from '@/components/WorkerNav';
import { useHydrated } from '@/lib/demo/hooks';
import { filterTasks, taskDistanceMiles } from '@/lib/demo/selectors';
import { useDemoStore } from '@/lib/demo/store';
import type { Task } from '@/lib/demo/types';
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Calendar,
  ChevronDown,
  Clock3,
  Home,
  List,
  LocateFixed,
  Lock,
  Map,
  MapPin,
  Navigation,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from 'lucide-react';

type ViewMode = 'desktop' | 'mobile';

const taskImages = ['/task_thumbnail.png', '/volunteers_working.png'];

function pinColor(status: Task['status']) {
  switch (status) {
    case 'claimed':
    case 'in_progress': return '#d9892f'; // amber
    case 'submitted': return '#2563eb';   // blue
    case 'approved': return '#15803d';    // deep green done
    case 'rejected': return '#b91c1c';    // red
    default: return '#197243';            // open = brand green
  }
}

function getCoordinates(lat: number, lng: number) {
  const latMin = 34.0425;
  const latMax = 34.0465;
  const lngMin = -118.253;
  const lngMax = -118.2475;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const y = (1 - (lat - latMin) / (latMax - latMin)) * 100;

  return {
    x: Math.min(Math.max(x, 8), 92),
    y: Math.min(Math.max(y, 12), 86),
  };
}

function taskImage(task: Task, index = 0) {
  if (task.taskType === 'planter') return '/volunteers_working.png';
  return taskImages[index % taskImages.length];
}

function taskTypeLabel(task: Task) {
  if (task.taskType === 'planter') return 'Maintenance';
  if (task.taskType === 'painting') return 'Painting';
  if (task.taskType === 'verify') return 'Verify';
  return 'Cleanup';
}

function difficultyLabel(task: Task) {
  if (task.payoutAmount >= 100) return 'Team';
  if (task.payoutAmount >= 40) return 'Medium';
  return 'Easy';
}

function activeTaskValue(tasks: Task[]) {
  return tasks
    .filter((task) => task.status === 'open' && !task.isComingSoon && !task.isFundingNeeded)
    .reduce((sum, task) => sum + task.payoutAmount, 0);
}

function activeTaskMinutes(tasks: Task[]) {
  return tasks
    .filter((task) => task.status === 'open' && !task.isComingSoon && !task.isFundingNeeded)
    .reduce((sum, task) => sum + task.estimatedMinutes, 0);
}

function hourlyEquivalent(task: Task) {
  return Math.round((task.payoutAmount / task.estimatedMinutes) * 60);
}

export default function WorkerMap() {
  const tasks = useDemoStore((s) => s.tasks);
  const hydrated = useHydrated();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');

  const visibleTasks = useMemo(() => filterTasks(tasks, activeFilter), [tasks, activeFilter]);
  const selectedTask = visibleTasks.find((t) => t.id === selectedId) ?? visibleTasks[0] ?? tasks[0];

  function onSelectTask(task: Task) {
    setSelectedId(task.id);
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbf8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#197243] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbf8] text-[#111814]">
      <DesktopHeader viewMode={viewMode} onViewModeChange={setViewMode} />
      {viewMode === 'desktop' ? (
        <DesktopMapView
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSelectTask={onSelectTask}
          selectedTask={selectedTask}
          tasks={visibleTasks}
        />
      ) : (
        <MobileMapView
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSelectTask={onSelectTask}
          selectedTask={selectedTask}
          tasks={visibleTasks}
        />
      )}
    </div>
  );
}

function DesktopHeader({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e6e8e4] bg-white/95 px-6 py-4 shadow-sm backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6">
        <Link href="/" aria-label="CivicTree home">
          <CivicTreeLogo size="md" />
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-black text-[#101814] lg:flex">
          <Link href="/" className="hover:text-[#067333]">Main menu</Link>
          <Link href="/how-it-works" className="hover:text-[#067333]">How it works</Link>
          <Link href="/earn" className="hover:text-[#067333]">Earn</Link>
          <Link href="/for-cities" className="hover:text-[#067333]">For Cities</Link>
          <Link href="/sponsor" className="hover:text-[#067333]">Sponsor</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden h-11 items-center gap-2 rounded-xl border border-[#e2e5de] bg-white px-4 text-xs font-black text-[#197243] shadow-sm transition hover:bg-[#f7f8f4] md:inline-flex lg:hidden"
          >
            <Home size={15} />
            Main menu
          </Link>
          <div className="hidden rounded-2xl border border-[#e2e5de] bg-[#f7f8f4] p-1 md:flex">
            <button
              type="button"
              onClick={() => onViewModeChange('desktop')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${
                viewMode === 'desktop' ? 'bg-white text-[#067333] shadow-sm' : 'text-[#617067] hover:text-[#101814]'
              }`}
            >
              <Map size={15} />
              Desktop map
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('mobile')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${
                viewMode === 'mobile' ? 'bg-white text-[#067333] shadow-sm' : 'text-[#617067] hover:text-[#101814]'
              }`}
            >
              <Navigation size={15} />
              Mobile app
            </button>
          </div>

          <button type="button" className="relative hidden h-11 w-11 items-center justify-center rounded-full border border-[#e2e5de] bg-white md:flex">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#067333] px-1 text-[10px] font-black text-white">3</span>
          </button>

          <button type="button" className="flex items-center gap-3 rounded-full border border-[#e2e5de] bg-white py-1.5 pl-2 pr-4 shadow-sm">
            <span className="relative h-10 w-10 overflow-hidden rounded-full bg-[#dce8d8]">
              <Image src="/task_thumbnail.png" alt="Jordan profile" fill className="object-cover" sizes="40px" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-black leading-4">Jordan</span>
              <span className="block text-xs font-semibold text-[#667067]">Worker</span>
            </span>
            <ChevronDown size={16} className="text-[#667067]" />
          </button>
        </div>
      </div>
    </header>
  );
}

function DesktopMapView({
  activeFilter,
  onFilterChange,
  onSelectTask,
  selectedTask,
  tasks,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSelectTask: (task: Task) => void;
  selectedTask: Task | undefined;
  tasks: Task[];
}) {
  const selectedIndex = selectedTask ? Math.max(tasks.findIndex((task) => task.id === selectedTask.id), 0) : 0;
  const availableToday = activeTaskValue(tasks);
  const minutesToday = activeTaskMinutes(tasks);
  const hoursToday = Math.max(1, Math.round((minutesToday / 60) * 10) / 10);

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 md:px-8">
      <section className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#070b09] md:text-5xl">Find paid tasks near you</h1>
          <p className="mt-2 text-lg font-semibold text-[#5d665f]">Real work. Real impact. Real pay.</p>
          <p className="mt-2 text-sm font-black text-[#197243]">
            ${availableToday.toFixed(0)} available today across about {hoursToday} active hours.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" className="inline-flex min-w-[280px] items-center justify-between rounded-xl border border-[#e1e4dc] bg-white px-5 py-4 text-sm font-bold shadow-sm">
            <span className="inline-flex items-center gap-3">
              <MapPin className="text-[#197243]" size={20} />
              Near: 94110
            </span>
            <span className="inline-flex items-center gap-3 border-l border-[#e1e4dc] pl-5 text-[#5f6961]">
              Within 2 miles
              <ChevronDown size={16} />
            </span>
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-3 rounded-xl border border-[#e1e4dc] bg-white px-6 py-4 text-sm font-black shadow-sm">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
      </section>

      <DesktopFilters activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <section className="grid gap-6 xl:grid-cols-[450px_1fr]">
        <aside className="min-w-0">
          <div className="mb-3 text-sm font-semibold text-[#404a43]">
            {`${Math.max(tasks.length, 0)} tasks nearby · $${availableToday.toFixed(0)} available today`}
          </div>
          <div className="grid gap-3">
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-[#e1e4dc] bg-white p-6 text-center text-sm font-bold text-[#667067]">
                No tasks match this view yet.
              </div>
            ) : (
              tasks.slice(0, 5).map((task, index) => (
                <TaskListCard
                  index={index}
                  key={task.id}
                  onSelect={() => onSelectTask(task)}
                  selected={selectedTask?.id === task.id}
                  task={task}
                />
              ))
            )}
            <button type="button" className="flex h-14 items-center justify-center gap-2 rounded-xl border border-[#e1e4dc] bg-white text-sm font-black text-[#111814] shadow-sm">
              Load more tasks
              <ChevronDown size={16} />
            </button>
          </div>
        </aside>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#e2e5de] bg-white shadow-sm">
          {selectedTask && (
            <>
              <TaskMap selectedTask={selectedTask} tasks={visiblePins(tasks)} onSelectTask={onSelectTask} />
              <DesktopTaskDetail task={selectedTask} index={selectedIndex} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function visiblePins(tasks: Task[]) {
  return tasks.slice(0, 5);
}

function DesktopFilters({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  const filters = [
    ['all', 'All tasks', List],
    ['today', 'Today', Calendar],
    ['week', 'This week', Calendar],
    ['nearest', 'Sort: Nearest', ChevronDown],
    ['types', 'All types', ChevronDown],
    ['highest_pay', 'Pay: High to low', ChevronDown],
    ['quick', 'Beginner friendly', Star],
  ] as const;

  return (
    <div className="my-8 flex flex-wrap items-center gap-5 border-y border-[#edf0e9] bg-white/40 py-4">
      {filters.map(([id, label, Icon]) => (
        <button
          key={id}
          type="button"
          onClick={() => onFilterChange(id === 'today' || id === 'week' || id === 'nearest' || id === 'types' ? 'all' : id)}
          className={`inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-bold transition ${
            activeFilter === id || (id === 'all' && activeFilter === 'all')
              ? 'border-[#067333] bg-[#067333] text-white shadow-sm'
              : 'border-[#e1e4dc] bg-white text-[#111814] shadow-sm hover:border-[#b9c5b9]'
          }`}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
      <button type="button" onClick={() => onFilterChange('all')} className="ml-auto text-sm font-black text-[#197243]">
        Clear all
      </button>
    </div>
  );
}

function TaskListCard({
  index,
  onSelect,
  selected,
  task,
}: {
  index: number;
  onSelect: () => void;
  selected: boolean;
  task: Task;
}) {
  const type = taskTypeLabel(task);
  const difficulty = difficultyLabel(task);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid grid-cols-[96px_1fr_auto] gap-4 rounded-xl border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? 'border-[#197243] ring-1 ring-[#197243]' : 'border-[#e1e4dc]'
      }`}
    >
      <span className="relative h-24 overflow-hidden rounded-lg bg-[#e6ebe1]">
        <Image src={taskImage(task, index)} alt="" fill className="object-cover" sizes="96px" />
      </span>
      <span className="min-w-0 py-1">
        {selected && <span className="mb-2 inline-flex rounded-full bg-[#e4f3df] px-2.5 py-1 text-xs font-black text-[#197243]">Nearby</span>}
        <span className="block truncate text-lg font-black text-[#101814]">{task.title}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#46534a]">
          <span className="inline-flex items-center gap-1"><MapPin size={13} />{taskDistanceMiles(task).toFixed(1)} mi away</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={13} />{task.estimatedMinutes} min</span>
        </span>
        <span className="mt-3 flex gap-2">
          <span className="rounded-full bg-[#e4f3df] px-2.5 py-1 text-xs font-black text-[#197243]">{type}</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-black ${difficulty === 'Easy' ? 'bg-[#e4f3df] text-[#197243]' : 'bg-[#fff0d8] text-[#a05b12]'}`}>{difficulty}</span>
          <span className="rounded-full bg-[#f7f1d9] px-2.5 py-1 text-xs font-black text-[#7a5c0b]">${hourlyEquivalent(task)}/hr active</span>
        </span>
      </span>
      <span className="flex flex-col items-end justify-center pr-1">
        <span className="text-3xl font-black text-[#197243]">${Math.round(task.payoutAmount)}</span>
        <span className="mt-1 text-xs font-semibold text-[#667067]">Est. pay</span>
      </span>
    </button>
  );
}

function TaskMap({
  onSelectTask,
  selectedTask,
  tasks,
}: {
  onSelectTask: (task: Task) => void;
  selectedTask: Task;
  tasks: Task[];
}) {
  return (
    <div className="relative h-[380px] overflow-hidden border-b border-[#e2e5de] bg-[#eef0ea]">
      <div className="absolute inset-0 desktop-map-texture" />
      <MapLabel className="left-[16%] top-[8%]" label="16th St" />
      <MapLabel className="left-[48%] top-[12%]" label="18th St" />
      <MapLabel className="left-[14%] top-[33%]" label="MISSION DISTRICT" large />
      <MapLabel className="right-[13%] top-[31%]" label="DOGPATCH" large />
      <MapLabel className="left-[36%] top-[56%]" label="Cesar Chavez St" />
      <MapLabel className="right-[28%] top-[57%]" label="3rd St" rotate />
      <MapLabel className="right-[18%] top-[43%]" label="Bryant St" rotate />

      <div className="absolute left-[42%] top-[50%] flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#77aee9]/15">
        <span className="h-6 w-6 rounded-full border-4 border-white bg-[#2879ff] shadow-lg" />
      </div>

      {tasks.map((task, index) => {
        const fallbackPositions = [
          { x: 33, y: 17 },
          { x: 10, y: 58 },
          { x: 68, y: 32 },
          { x: 76, y: 68 },
          { x: 33, y: 58 },
        ];
        const coords = getCoordinates(task.location.lat, task.location.lng);
        const position = Number.isFinite(coords.x) ? coords : fallbackPositions[index];
        const selected = selectedTask.id === task.id;
        const color = pinColor(task.status);

        return (
          <button
            type="button"
            key={task.id}
            onClick={() => onSelectTask(task)}
            className={`absolute flex h-12 min-w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full rounded-bl-sm px-2 text-sm font-black text-white shadow-lg transition hover:scale-105 ${
              selected ? 'z-20 scale-110 ring-4 ring-white/30' : ''
            }`}
            style={{ left: `${position.x}%`, top: `${position.y}%`, backgroundColor: color }}
            aria-label={`Select ${task.title}`}
          >
            ${Math.round(task.payoutAmount)}
          </button>
        );
      })}

      <button type="button" className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl bg-white text-[#111814] shadow-lg">
        <LocateFixed size={22} />
      </button>
      <div className="absolute bottom-9 right-5 overflow-hidden rounded-xl bg-white shadow-lg">
        <button type="button" className="flex h-12 w-12 items-center justify-center border-b border-[#e2e5de] text-2xl font-semibold">+</button>
        <button type="button" className="flex h-12 w-12 items-center justify-center text-2xl font-semibold">-</button>
      </div>
    </div>
  );
}

function MapLabel({
  className,
  label,
  large = false,
  rotate = false,
}: {
  className: string;
  label: string;
  large?: boolean;
  rotate?: boolean;
}) {
  return (
    <span className={`absolute select-none font-semibold text-[#8a928b] ${large ? 'text-lg tracking-wide' : 'text-sm'} ${rotate ? 'rotate-90' : ''} ${className}`}>
      {label}
    </span>
  );
}

function DesktopTaskDetail({ task, index }: { task: Task; index: number }) {
  return (
    <div className="grid gap-6 bg-white p-6 lg:grid-cols-[310px_1fr] xl:grid-cols-[330px_1fr]">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#e6ebe1]">
          <Image src={taskImage(task, index)} alt={task.title} fill className="object-cover" sizes="330px" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {['Before', 'After'].map((label, photoIndex) => (
            <div key={label}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e6ebe1]">
                <Image src={taskImages[(index + photoIndex) % taskImages.length]} alt={`${label} example`} fill className="object-cover" sizes="160px" />
                <span className="absolute bottom-2 left-2 text-xs font-black text-white drop-shadow">{label}</span>
              </div>
              <div className="mt-2 text-xs font-semibold text-[#101814]">{label}{label === 'After' ? ' (example)' : ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#edf0e9] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-[#101814]">{task.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#667067]">
              <span className="inline-flex items-center gap-1.5"><MapPin size={16} />Sponsored by Broadway Block Reset</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4f3df] px-3 py-1 font-black text-[#197243]">
                <ShieldCheck size={15} />
                Verified
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-[#197243]">${Math.round(task.payoutAmount)}</div>
            <div className="mt-1 text-sm font-semibold text-[#667067]">Est. pay</div>
          </div>
        </div>

        <p className="mt-7 max-w-2xl text-base leading-7 text-[#344139]">{task.description}</p>

        <div className="mt-7 grid overflow-hidden rounded-xl border border-[#edf0e9] bg-[#fcfcfa] sm:grid-cols-4">
          <Metric label="Estimated time" value={`${task.estimatedMinutes} min`} />
          <Metric label="Distance" value={`${taskDistanceMiles(task).toFixed(1)} mi`} />
          <Metric label="Active rate" value={`$${hourlyEquivalent(task)}/hr`} accent />
          <Metric label="Difficulty" value={difficultyLabel(task)} accent />
        </div>

        <div className="mt-5 grid gap-4 rounded-xl border border-[#edf0e9] bg-[#fcfcfa] p-5 md:grid-cols-2">
          <InfoBlock icon={BriefcaseBusiness} title="Proof required" copy="Before and after photos from same angle" />
          <InfoBlock icon={Lock} title="You'll need" copy={task.requiredTools.length ? task.requiredTools.join(', ') : 'Gloves, trash bag'} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[180px_1fr]">
          <button type="button" className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-[#e1e4dc] bg-white text-sm font-black text-[#101814]">
            <Bookmark size={20} />
            Save task
          </button>
          <Link href={`/worker/task/${task.id}/claim?handoff=desktop`} className="inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-[#197243] text-sm font-black text-white shadow-[0_14px_28px_rgba(25,114,67,0.2)]">
            <Lock size={18} />
            Claim this task
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metric({ accent = false, label, value }: { accent?: boolean; label: string; value: string }) {
  return (
    <div className="border-b border-[#edf0e9] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className={`text-base font-black ${accent ? 'text-[#197243]' : 'text-[#101814]'}`}>{value}</div>
      <div className="mt-1 text-xs font-semibold text-[#667067]">{label}</div>
    </div>
  );
}

function InfoBlock({
  copy,
  icon: Icon,
  title,
}: {
  copy: string;
  icon: typeof BriefcaseBusiness;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={20} className="mt-0.5 text-[#101814]" />
      <div>
        <div className="text-sm font-black text-[#101814]">{title}</div>
        <div className="mt-1 text-xs font-semibold text-[#667067]">{copy}</div>
      </div>
    </div>
  );
}

function MobileMapView({
  activeFilter,
  onFilterChange,
  onSelectTask,
  selectedTask,
  tasks,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSelectTask: (task: Task) => void;
  selectedTask: Task | undefined;
  tasks: Task[];
}) {
  const availableToday = activeTaskValue(tasks);
  const filters = [
    { id: 'all', name: 'Nearby' },
    { id: 'quick', name: 'Quick' },
    { id: 'highest_pay', name: 'Highest pay' },
    { id: 'no_tools', name: 'No tools' },
    { id: 'verify', name: 'Verify' },
    { id: 'funding', name: 'Needs funding' },
  ];

  return (
    <main className="mx-auto min-h-[calc(100vh-76px)] max-w-md border-x border-[#e2e5de] bg-white pb-24 shadow-sm">
      <div className="sticky top-[73px] z-10 flex items-center justify-between border-b border-[#e2e5de] bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <Map size={16} className="text-[#667067]" />
          <span className="text-xs font-black">Downtown LA Map</span>
          <span className="rounded-full bg-[#e4f3df] px-2 py-0.5 text-[10px] font-black text-[#197243]">{tasks.length} tasks · ${availableToday.toFixed(0)}</span>
        </div>
        <Link href="/worker/report" className="text-[#667067] hover:text-[#101814]">
          <Plus size={18} />
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-[#e2e5de] bg-[#f7f8f4] px-4 py-3">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-black ${
              activeFilter === filter.id ? 'border-[#197243] bg-[#197243] text-white' : 'border-[#e2e5de] bg-white text-[#667067]'
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      <div className="relative min-h-[430px] overflow-hidden bg-[#f1f2ec]">
        <div className="absolute inset-0 desktop-map-texture opacity-80" />
        <div className="absolute inset-8 rounded-[2rem] border-2 border-[#197243]/20 bg-[#197243]/5" />
        <div className="absolute left-[45%] top-[55%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="z-10 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
          <div className="absolute h-10 w-10 animate-ping rounded-full bg-blue-400/30" />
        </div>

        {tasks.map((task) => {
          const { x, y } = getCoordinates(task.location.lat, task.location.lng);
          const selected = selectedTask?.id === task.id;
          const color = pinColor(task.status);

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task)}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-white shadow-md transition ${
                selected ? 'z-30 h-9 w-9 scale-125 ring-2 ring-white/30' : 'z-20 h-7 w-7 hover:scale-110'
              }`}
              style={{ left: `${x}%`, top: `${y}%`, backgroundColor: color }}
            >
              <MapPin size={selected ? 15 : 12} />
            </button>
          );
        })}
      </div>

      {selectedTask && (
        <div className="-mt-16 mx-4 flex items-center gap-4 rounded-3xl border border-[#e2e5de] bg-white p-4 shadow-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d7efd2] bg-[#e4f3df] text-[#197243]">
            <MapPin size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-black">{selectedTask.title}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-[#667067]">
              <span>{taskDistanceMiles(selectedTask).toFixed(1)} mi away</span>
              <span>{selectedTask.estimatedMinutes} min</span>
              <span className="font-black text-[#197243]">{difficultyLabel(selectedTask)}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-base font-black text-[#197243]">${selectedTask.payoutAmount.toFixed(0)}</span>
            <Link href={`/worker/task/${selectedTask.id}`} className="inline-flex items-center gap-1 rounded-lg bg-[#197243] px-3 py-1.5 text-[10px] font-black text-white">
              View
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 px-4">
        <Link href="/worker/report" className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e2e5de] bg-white text-xs font-black text-[#101814] shadow-sm">
          <Search size={16} />
          Report something nearby
        </Link>
      </div>

      <WorkerNav />
    </main>
  );
}
