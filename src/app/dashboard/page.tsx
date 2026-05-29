'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin, TrendingUp, Users, DollarSign, Activity,
  CheckSquare, Award, ArrowRight, Flag, Target,
  BarChart2, Zap, X, ChevronRight, Star, Shield,
  Map, Home, Eye, Clock, Layers
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type NeighborhoodState = 'needs-care' | 'active' | 'improving' | 'thriving' | 'fully-stewarded';
type RightTab = 'overview' | 'leaderboards' | 'campaigns' | 'activity';

interface Neighborhood {
  id: string;
  name: string;
  shortName: string;
  col: number;
  row: number;
  level: number;
  state: NeighborhoodState;
  progress: number;
  tasksCompleted: number;
  dollarsPaid: number;
  blocksImproved: number;
  openTasks: number;
  reports: number;
  campaign: string | null;
  topCrew: string | null;
  sponsor: string | null;
  description: string;
}

// ─── Mocked Data ────────────────────────────────────────────────────────────

const NEIGHBORHOODS: Neighborhood[] = [
  { id: 'los-feliz', name: 'Los Feliz', shortName: 'Los Feliz', col: 4, row: 0, level: 3, state: 'improving', progress: 62, tasksCompleted: 168, dollarsPaid: 4200, blocksImproved: 11, openTasks: 5, reports: 2, campaign: null, topCrew: 'Hillside Crew', sponsor: 'Friends of Griffith Park', description: 'Hillside residential blocks near Griffith Park. Strong momentum heading into Level 4.' },
  { id: 'chinatown', name: 'Chinatown / Little Tokyo', shortName: 'Chinatown', col: 5, row: 0, level: 3, state: 'improving', progress: 58, tasksCompleted: 143, dollarsPaid: 3580, blocksImproved: 9, openTasks: 7, reports: 3, campaign: 'Heritage Corridor', topCrew: 'Hill Street Stewards', sponsor: null, description: 'Active Heritage Corridor campaign. Historic blocks with high foot traffic.' },
  { id: 'westwood', name: 'Westwood / Brentwood', shortName: 'Westwood', col: 1, row: 1, level: 3, state: 'improving', progress: 55, tasksCompleted: 132, dollarsPaid: 3300, blocksImproved: 8, openTasks: 6, reports: 3, campaign: null, topCrew: null, sponsor: 'UCLA', description: 'Westside neighborhoods with active UCLA sponsorship. Consistent quality scores.' },
  { id: 'hollywood', name: 'Hollywood', shortName: 'Hollywood', col: 3, row: 1, level: 2, state: 'active', progress: 40, tasksCompleted: 98, dollarsPaid: 2450, blocksImproved: 6, openTasks: 9, reports: 4, campaign: 'Hollywood Care Drive', topCrew: 'Vine Street Crew', sponsor: 'Hollywood BID', description: 'BID-funded campaign active along the Walk of Fame corridor. Growing crew base.' },
  { id: 'santa-monica', name: 'Santa Monica', shortName: 'Santa Monica', col: 0, row: 2, level: 4, state: 'fully-stewarded', progress: 95, tasksCompleted: 445, dollarsPaid: 11200, blocksImproved: 31, openTasks: 1, reports: 0, campaign: null, topCrew: 'Ocean Ave Stewards', sponsor: 'City of Santa Monica', description: 'Top-performing neighborhood in LA. A fully stewarded model others should follow.' },
  { id: 'palms', name: 'Palms / Mar Vista', shortName: 'Palms', col: 1, row: 2, level: 2, state: 'active', progress: 25, tasksCompleted: 61, dollarsPaid: 1520, blocksImproved: 3, openTasks: 13, reports: 8, campaign: null, topCrew: 'Westside Crew', sponsor: null, description: 'Mid-range activity. Several pending reports waiting for worker coverage.' },
  { id: 'mid-city', name: 'Mid-City', shortName: 'Mid-City', col: 2, row: 2, level: 1, state: 'needs-care', progress: 8, tasksCompleted: 12, dollarsPaid: 290, blocksImproved: 1, openTasks: 18, reports: 9, campaign: null, topCrew: null, sponsor: null, description: 'Underserved area with high backlog. Needs crew recruitment and sponsor outreach.' },
  { id: 'koreatown', name: 'Koreatown', shortName: 'K-Town', col: 3, row: 2, level: 2, state: 'active', progress: 35, tasksCompleted: 89, dollarsPaid: 2210, blocksImproved: 5, openTasks: 6, reports: 7, campaign: null, topCrew: 'K-Town Stewards', sponsor: 'Neighborhood Council', description: 'Neighborhood Council backing driving consistent activity. Close to Level 3.' },
  { id: 'silver-lake', name: 'Silver Lake / Echo Park', shortName: 'Silver Lake', col: 4, row: 2, level: 1, state: 'needs-care', progress: 12, tasksCompleted: 23, dollarsPaid: 540, blocksImproved: 1, openTasks: 15, reports: 12, campaign: null, topCrew: null, sponsor: null, description: 'High report volume with limited worker response. Needs urgent task deployment.' },
  { id: 'venice', name: 'Venice / Marina del Rey', shortName: 'Venice', col: 0, row: 3, level: 4, state: 'thriving', progress: 88, tasksCompleted: 312, dollarsPaid: 7840, blocksImproved: 22, openTasks: 2, reports: 1, campaign: null, topCrew: 'Boardwalk Brigade', sponsor: 'Venice BID', description: 'Boardwalk Brigade is the #2 crew in LA. A model for coastal neighborhood stewardship.' },
  { id: 'culver-city', name: 'Culver City', shortName: 'Culver City', col: 1, row: 3, level: 3, state: 'thriving', progress: 75, tasksCompleted: 201, dollarsPaid: 5120, blocksImproved: 14, openTasks: 4, reports: 2, campaign: 'Culver Green', topCrew: 'Culver Civic League', sponsor: 'Culver City', description: 'City-funded Culver Green initiative delivering reliable results. Approaching Level 4.' },
  { id: 'downtown', name: 'Downtown / Historic Core', shortName: 'Downtown', col: 3, row: 3, level: 3, state: 'improving', progress: 42, tasksCompleted: 127, dollarsPaid: 3240, blocksImproved: 8, openTasks: 12, reports: 5, campaign: 'Broadway Block Reset', topCrew: 'Spring Street Stewards', sponsor: 'City of LA', description: 'Primary DTLA pilot. Broadway Block Reset is 42% complete. Most-watched block in LA.' },
  { id: 'arts-district', name: 'Arts District', shortName: 'Arts District', col: 4, row: 3, level: 2, state: 'active', progress: 28, tasksCompleted: 64, dollarsPaid: 1680, blocksImproved: 3, openTasks: 8, reports: 3, campaign: null, topCrew: 'East Side Crew', sponsor: null, description: 'Grassroots activity without sponsorship. Creative community driving block improvements.' },
  { id: 'boyle-heights', name: 'Boyle Heights', shortName: 'Boyle Heights', col: 5, row: 3, level: 2, state: 'active', progress: 31, tasksCompleted: 76, dollarsPaid: 1890, blocksImproved: 4, openTasks: 11, reports: 6, campaign: null, topCrew: 'Soto Street Crew', sponsor: 'Eastside Community', description: 'Strong local crew with community backing. Approaching the midpoint to Level 3.' },
  { id: 'south-la', name: 'South LA', shortName: 'South LA', col: 2, row: 4, level: 1, state: 'needs-care', progress: 5, tasksCompleted: 8, dollarsPaid: 190, blocksImproved: 0, openTasks: 24, reports: 18, campaign: 'South LA Restore', topCrew: null, sponsor: null, description: 'Highest-need area in the system. South LA Restore campaign is live but needs sponsor funding.' },
];

const STATE_CONFIG: Record<NeighborhoodState, { label: string; accent: string; bg: string; border: string; text: string; glow: string }> = {
  'needs-care':      { label: 'Needs Care',      accent: '#f87171', bg: 'rgba(239,68,68,0.13)',   border: 'rgba(239,68,68,0.35)',   text: '#fca5a5', glow: 'rgba(239,68,68,0.25)' },
  'active':          { label: 'Active',           accent: '#fbbf24', bg: 'rgba(251,191,36,0.11)',  border: 'rgba(251,191,36,0.32)',  text: '#fde68a', glow: 'rgba(251,191,36,0.2)'  },
  'improving':       { label: 'Improving',        accent: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.32)',  text: '#6ee7b7', glow: 'rgba(52,211,153,0.2)'  },
  'thriving':        { label: 'Thriving',         accent: '#10b981', bg: 'rgba(16,185,129,0.16)',  border: 'rgba(16,185,129,0.4)',   text: '#34d399', glow: 'rgba(16,185,129,0.25)' },
  'fully-stewarded': { label: 'Fully Stewarded',  accent: '#a7f3d0', bg: 'rgba(167,243,208,0.14)', border: 'rgba(167,243,208,0.45)', text: '#a7f3d0', glow: 'rgba(167,243,208,0.3)' },
};

const LEADERBOARD_WORKERS = [
  { rank: 1, name: 'Maria R.', neighborhood: 'Venice', tasks: 47, earned: 1240, quality: 99 },
  { rank: 2, name: 'Carlos T.', neighborhood: 'Downtown', tasks: 43, earned: 1130, quality: 98 },
  { rank: 3, name: 'Austin V.', neighborhood: 'Historic Core', tasks: 38, earned: 1040, quality: 98 },
  { rank: 4, name: 'Priya K.', neighborhood: 'Koreatown', tasks: 35, earned: 920, quality: 97 },
  { rank: 5, name: 'James M.', neighborhood: 'Culver City', tasks: 31, earned: 810, quality: 96 },
];

const LEADERBOARD_CREWS = [
  { rank: 1, name: 'Ocean Ave Stewards', neighborhood: 'Santa Monica', members: 12, tasks: 445 },
  { rank: 2, name: 'Boardwalk Brigade', neighborhood: 'Venice', members: 9, tasks: 312 },
  { rank: 3, name: 'Spring Street Stewards', neighborhood: 'Downtown', members: 8, tasks: 201 },
  { rank: 4, name: 'Culver Civic League', neighborhood: 'Culver City', members: 7, tasks: 168 },
  { rank: 5, name: 'Hillside Crew', neighborhood: 'Los Feliz', members: 5, tasks: 127 },
];

const ACTIVE_CAMPAIGNS = [
  { name: 'Broadway Block Reset', neighborhood: 'Downtown', progress: 42, tasksLeft: 58, budget: '$3,160', sponsor: 'City of LA' },
  { name: 'Hollywood Care Drive', neighborhood: 'Hollywood', progress: 40, tasksLeft: 60, budget: '$2,400', sponsor: 'Hollywood BID' },
  { name: 'Heritage Corridor', neighborhood: 'Chinatown', progress: 58, tasksLeft: 42, budget: '$1,680', sponsor: null },
  { name: 'Culver Green', neighborhood: 'Culver City', progress: 75, tasksLeft: 25, budget: '$1,250', sponsor: 'Culver City' },
  { name: 'South LA Restore', neighborhood: 'South LA', progress: 5, tasksLeft: 95, budget: 'Needs funding', sponsor: null },
];

const ACTIVITY_FEED = [
  { time: '2m ago',  text: 'Litter cleared on Broadway & 7th',               neighborhood: 'Downtown',    amount: 18 },
  { time: '8m ago',  text: 'Planter maintained near Echo Park Lake',          neighborhood: 'Silver Lake', amount: 24 },
  { time: '14m ago', text: 'Graffiti reported on Santa Monica Blvd',          neighborhood: 'Hollywood',   amount: null },
  { time: '19m ago', text: 'Sidewalk cleared on Main St',                     neighborhood: 'Venice',      amount: 45 },
  { time: '31m ago', text: 'Report verified on 7th & Main',                   neighborhood: 'Downtown',    amount: 3 },
  { time: '45m ago', text: 'Trash cleared near Culver City Arts Center',      neighborhood: 'Culver City', amount: 22 },
  { time: '1h ago',  text: 'New crew formed: Soto Street Crew',               neighborhood: 'Boyle Hts',   amount: null },
  { time: '1h ago',  text: '$810 paid out to James M.',                       neighborhood: 'Culver City', amount: null },
];

// ─── Map constants ──────────────────────────────────────────────────────────

const CELL_W = 126;
const CELL_H = 92;
const GAP    = 8;
const COLS   = 6;
const ROWS   = 5;

const MAP_W = COLS * (CELL_W + GAP) - GAP;
const MAP_H = ROWS * (CELL_H + GAP) - GAP;

// ─── Nav links ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Command Center', href: '/dashboard',               icon: Home        },
  { label: 'LA Map',         href: '/dashboard',               icon: Map         },
  { label: 'Campaigns',      href: '/dashboard',               icon: Flag        },
  { label: 'Leaderboards',   href: '/dashboard',               icon: Award       },
  { label: 'Workers',        href: '/admin/workers/worker-austin-id', icon: Users },
  { label: 'Review',         href: '/admin/submissions',       icon: CheckSquare },
  { label: 'Sponsor View',   href: '/sponsor',                 icon: Zap         },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [selected, setSelected]     = useState<Neighborhood | null>(null);
  const [rightTab, setRightTab]     = useState<RightTab>('overview');

  const handleTileClick = (n: Neighborhood) => {
    setSelected(prev => prev?.id === n.id ? null : n);
  };

  const needsCare = NEIGHBORHOODS.filter(n => n.state === 'needs-care');
  const totalOpenTasks = NEIGHBORHOODS.reduce((s, n) => s + n.openTasks, 0);
  const totalReports   = NEIGHBORHOODS.reduce((s, n) => s + n.reports, 0);

  return (
    <div className="dashboard-root flex min-h-screen overflow-hidden" style={{ background: '#0c1118', color: '#e6edf3', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-[210px] shrink-0 flex flex-col border-r" style={{ background: '#10181f', borderColor: 'rgba(255,255,255,0.07)' }}>
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: '#22c55e', color: '#0c1118' }}>CT</div>
            <span className="font-black text-sm tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#e6edf3' }}>CivicTree</span>
          </div>
          <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#4a6278' }}>Command Center</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                color: label === 'Command Center' ? '#22c55e' : '#7d8fa1',
                background: label === 'Command Center' ? 'rgba(34,197,94,0.1)' : 'transparent',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        {/* City stats */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: '#4a6278' }}>Los Angeles, Live</p>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: '#7d8fa1' }}>Neighborhoods</span>
              <span className="font-bold" style={{ color: '#e6edf3' }}>15</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#7d8fa1' }}>Open tasks</span>
              <span className="font-bold" style={{ color: '#fbbf24' }}>{totalOpenTasks}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#7d8fa1' }}>Pending reports</span>
              <span className="font-bold" style={{ color: '#f87171' }}>{totalReports}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#7d8fa1' }}>Need care</span>
              <span className="font-bold" style={{ color: '#f87171' }}>{needsCare.length} zones</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top stats bar */}
        <header className="shrink-0 flex items-center gap-4 px-6 py-3 border-b" style={{ background: '#10181f', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-1.5 mr-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            <span className="text-[11px] font-bold" style={{ color: '#22c55e' }}>Live</span>
          </div>
          {[
            { label: 'Tasks today',       value: '34',      icon: CheckSquare, color: '#22c55e' },
            { label: 'Paid out today',    value: '$847',    icon: DollarSign,  color: '#34d399' },
            { label: 'Blocks improved',   value: '7',       icon: TrendingUp,  color: '#60a5fa' },
            { label: 'Reports waiting',   value: '23',      icon: Activity,    color: '#f87171' },
            { label: 'Reviews pending',   value: '6',       icon: Eye,         color: '#fbbf24' },
            { label: 'Active workers',    value: '18',      icon: Users,       color: '#c4b5fd' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-1.5 rounded-lg border" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <Icon size={13} style={{ color }} />
              <div>
                <div className="text-[10px] font-semibold" style={{ color: '#4a6278' }}>{label}</div>
                <div className="text-sm font-black leading-none" style={{ fontFamily: "'Outfit', sans-serif", color }}>{value}</div>
              </div>
            </div>
          ))}
          <div className="ml-auto flex gap-2">
            <Link href="/worker/today" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#7d8fa1' }}>
              <MapPin size={12} />
              Worker App
            </Link>
            <Link href="/admin/submissions" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: '#22c55e', color: '#0c1118' }}>
              <CheckSquare size={12} />
              Review Queue
            </Link>
          </div>
        </header>

        {/* Content: Map + Right panel */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Map area ── */}
          <main className="flex-1 overflow-auto p-6">
            {/* Map header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Los Angeles</h1>
                <p className="text-xs mt-0.5" style={{ color: '#4a6278' }}>Click any neighborhood to explore. {needsCare.length} zones need care.</p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-3">
                {(Object.entries(STATE_CONFIG) as [NeighborhoodState, typeof STATE_CONFIG[NeighborhoodState]][]).map(([state, cfg]) => (
                  <div key={state} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm" style={{ background: cfg.accent }} />
                    <span className="text-[10px] font-medium" style={{ color: '#4a6278' }}>{cfg.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The LA Map grid */}
            <div className="relative" style={{ width: MAP_W, height: MAP_H }}>
              {/* Empty cell background grid */}
              {Array.from({ length: COLS * ROWS }).map((_, i) => {
                const col = i % COLS;
                const row = Math.floor(i / COLS);
                return (
                  <div
                    key={i}
                    className="absolute rounded-xl"
                    style={{
                      left:   col * (CELL_W + GAP),
                      top:    row * (CELL_H + GAP),
                      width:  CELL_W,
                      height: CELL_H,
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  />
                );
              })}

              {/* Neighborhood tiles */}
              {NEIGHBORHOODS.map(n => {
                const cfg = STATE_CONFIG[n.state];
                const isSelected = selected?.id === n.id;
                const isPulsing  = n.state === 'needs-care';

                return (
                  <div
                    key={n.id}
                    onClick={() => handleTileClick(n)}
                    className={`absolute rounded-xl cursor-pointer transition-all duration-200 ${isPulsing ? 'needs-care-pulse' : ''}`}
                    style={{
                      left:      n.col * (CELL_W + GAP),
                      top:       n.row * (CELL_H + GAP),
                      width:     CELL_W,
                      height:    CELL_H,
                      background: cfg.bg,
                      border:    `1.5px solid ${isSelected ? '#60a5fa' : cfg.border}`,
                      boxShadow: isSelected
                        ? `0 0 0 2px rgba(96,165,250,0.4), 0 0 24px rgba(96,165,250,0.2)`
                        : isPulsing
                        ? `0 0 12px ${cfg.glow}`
                        : 'none',
                      transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                      zIndex:    isSelected ? 10 : 1,
                    }}
                  >
                    <div className="p-2.5 h-full flex flex-col justify-between">
                      {/* Level + state */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: cfg.text }}>
                            Lv {n.level}
                          </span>
                          {n.campaign && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                              Campaign
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-bold leading-tight mt-0.5" style={{ color: '#e6edf3' }}>
                          {n.shortName}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.1)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${n.progress}%`, background: cfg.accent }}
                          />
                        </div>
                        <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{n.progress}%</div>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-2 text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <span className="flex items-center gap-0.5">
                          <Target size={8} />
                          {n.openTasks}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Activity size={8} />
                          {n.reports}
                        </span>
                        {n.sponsor && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Zap size={8} style={{ color: '#fbbf24' }} />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Water/Pacific label */}
            <div className="mt-3 flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: 'rgba(96,165,250,0.15)' }} />
              <span className="text-[10px] font-semibold" style={{ color: 'rgba(96,165,250,0.4)' }}>← Pacific Ocean</span>
            </div>
          </main>

          {/* ── Right panel ── */}
          <aside className="w-[340px] shrink-0 flex flex-col border-l overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#10181f' }}>

            {selected ? (
              /* Neighborhood Detail */
              <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: STATE_CONFIG[selected.state].text }}>
                        Level {selected.level} · {STATE_CONFIG[selected.state].label}
                      </span>
                      <h2 className="text-base font-black leading-tight mt-0.5" style={{ fontFamily: "'Outfit', sans-serif", color: '#e6edf3' }}>
                        {selected.name}
                      </h2>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#4a6278' }}>
                      <X size={16} />
                    </button>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: '#7d8fa1' }}>{selected.description}</p>

                  {/* Progress to next level */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: '#7d8fa1' }}>Progress to Level {selected.level + 1}</span>
                      <span className="font-bold" style={{ color: STATE_CONFIG[selected.state].accent }}>{selected.progress}%</span>
                    </div>
                    <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${selected.progress}%`, background: STATE_CONFIG[selected.state].accent }} />
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: '#4a6278' }}>
                      Help this block level up — {100 - selected.progress} points to go.
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: '#4a6278' }}>All-time stats</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Tasks done', value: selected.tasksCompleted.toString() },
                      { label: 'Paid out',   value: `$${selected.dollarsPaid.toLocaleString()}` },
                      { label: 'Blocks',     value: selected.blocksImproved.toString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="text-base font-black" style={{ fontFamily: "'Outfit', sans-serif", color: '#e6edf3' }}>{value}</div>
                        <div className="text-[9px] mt-0.5" style={{ color: '#4a6278' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-3">
                    <div className="flex-1 rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      <div>
                        <div className="text-[9px] font-bold" style={{ color: '#fbbf24' }}>Open tasks</div>
                        <div className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif", color: '#fde68a' }}>{selected.openTasks}</div>
                      </div>
                      <Target size={18} style={{ color: '#fbbf24', opacity: 0.6 }} />
                    </div>
                    <div className="flex-1 rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div>
                        <div className="text-[9px] font-bold" style={{ color: '#f87171' }}>Reports</div>
                        <div className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif", color: '#fca5a5' }}>{selected.reports}</div>
                      </div>
                      <Activity size={18} style={{ color: '#f87171', opacity: 0.6 }} />
                    </div>
                  </div>
                </div>

                {/* Campaign */}
                {selected.campaign && (
                  <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{ color: '#4a6278' }}>Active campaign</p>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      <div className="flex items-start gap-2 mb-3">
                        <Flag size={14} style={{ color: '#fbbf24', marginTop: 1 }} />
                        <div>
                          <div className="text-sm font-bold" style={{ color: '#fde68a' }}>{selected.campaign}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: '#d97706' }}>
                            {ACTIVE_CAMPAIGNS.find(c => c.name === selected.campaign)?.tasksLeft} tasks left
                          </div>
                        </div>
                      </div>
                      <div className="w-full rounded-full overflow-hidden" style={{ height: 5, background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${ACTIVE_CAMPAIGNS.find(c => c.name === selected.campaign)?.progress ?? 0}%`, background: '#fbbf24' }} />
                      </div>
                      <div className="text-[10px] mt-1.5 font-bold" style={{ color: '#fbbf24' }}>
                        {selected.campaign} is {ACTIVE_CAMPAIGNS.find(c => c.name === selected.campaign)?.progress}% complete.
                      </div>
                    </div>
                  </div>
                )}

                {/* Crew + Sponsor */}
                <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: '#4a6278' }}>Top crew</p>
                      {selected.topCrew ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
                            <Users size={11} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: '#e6edf3' }}>{selected.topCrew}</span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#4a6278' }}>No crew yet. Be the first.</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: '#4a6278' }}>Sponsor</p>
                      {selected.sponsor ? (
                        <div className="flex items-center gap-2">
                          <Zap size={12} style={{ color: '#fbbf24' }} />
                          <span className="text-xs font-semibold" style={{ color: '#e6edf3' }}>{selected.sponsor}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: '#4a6278' }}>No sponsor. This zone needs one.</span>
                          <Link href="/sponsor" className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-80" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                            Fund it
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="p-5 flex flex-col gap-2">
                  <Link
                    href="/worker/map"
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: '#22c55e', color: '#0c1118' }}
                  >
                    <span>Steward this neighborhood</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/admin/tasks/create"
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold border transition-all hover:bg-white/5"
                    style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#7d8fa1' }}
                  >
                    <span>Create tasks here</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ) : (
              /* Default panel: tabs */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  {(['overview', 'leaderboards', 'campaigns', 'activity'] as RightTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setRightTab(tab)}
                      className="flex-1 py-3 text-[10px] font-black uppercase tracking-wider capitalize transition-colors"
                      style={{
                        color: rightTab === tab ? '#22c55e' : '#4a6278',
                        borderBottom: rightTab === tab ? '2px solid #22c55e' : '2px solid transparent',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4">

                  {/* ── OVERVIEW ── */}
                  {rightTab === 'overview' && (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#22c55e' }}>DTLA Pilot — Day 1</p>
                        <p className="text-sm font-black leading-snug mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Los Angeles is your game board.</p>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#7d8fa1' }}>Click any neighborhood to see progress, tasks, campaigns, and crews. Help a block level up by completing verified tasks.</p>
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: '#4a6278' }}>Zones needing care</p>
                        {needsCare.map(n => (
                          <button
                            key={n.id}
                            onClick={() => setSelected(n)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1.5 text-left transition-all hover:bg-white/5"
                            style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)' }}
                          >
                            <div>
                              <div className="text-xs font-bold" style={{ color: '#fca5a5' }}>{n.name}</div>
                              <div className="text-[10px]" style={{ color: '#f87171' }}>{n.openTasks} tasks open · {n.reports} reports</div>
                            </div>
                            <ChevronRight size={14} style={{ color: '#f87171' }} />
                          </button>
                        ))}
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: '#4a6278' }}>Highest performing</p>
                        {NEIGHBORHOODS
                          .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
                          .slice(0, 3)
                          .map(n => (
                            <button
                              key={n.id}
                              onClick={() => setSelected(n)}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1.5 text-left transition-all hover:bg-white/5"
                              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
                            >
                              <div>
                                <div className="text-xs font-bold" style={{ color: '#e6edf3' }}>{n.shortName}</div>
                                <div className="text-[10px]" style={{ color: '#4a6278' }}>{n.tasksCompleted} tasks · ${n.dollarsPaid.toLocaleString()} paid</div>
                              </div>
                              <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: STATE_CONFIG[n.state].bg, color: STATE_CONFIG[n.state].text }}>
                                Lv {n.level}
                              </span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* ── LEADERBOARDS ── */}
                  {rightTab === 'leaderboards' && (
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: '#4a6278' }}>Top stewards this week</p>
                        {LEADERBOARD_WORKERS.map(w => (
                          <div
                            key={w.rank}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5"
                            style={{ background: w.rank === 1 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${w.rank === 1 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}` }}
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                              style={{
                                background: w.rank === 1 ? '#fbbf24' : 'rgba(255,255,255,0.08)',
                                color: w.rank === 1 ? '#0c1118' : '#7d8fa1',
                              }}
                            >
                              {w.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold" style={{ color: '#e6edf3' }}>{w.name}</div>
                              <div className="text-[10px]" style={{ color: '#4a6278' }}>{w.neighborhood} · {w.tasks} tasks</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold" style={{ color: '#22c55e' }}>${w.earned}</div>
                              <div className="text-[9px]" style={{ color: '#4a6278' }}>{w.quality}% quality</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: '#4a6278' }}>Top crews</p>
                        {LEADERBOARD_CREWS.map(c => (
                          <div
                            key={c.rank}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                              style={{ background: 'rgba(255,255,255,0.08)', color: '#7d8fa1' }}
                            >
                              {c.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold truncate" style={{ color: '#e6edf3' }}>{c.name}</div>
                              <div className="text-[10px]" style={{ color: '#4a6278' }}>{c.neighborhood} · {c.members} members</div>
                            </div>
                            <div className="text-xs font-bold" style={{ color: '#34d399' }}>{c.tasks}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── CAMPAIGNS ── */}
                  {rightTab === 'campaigns' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#4a6278' }}>Active campaigns</p>
                      {ACTIVE_CAMPAIGNS.map(c => (
                        <div
                          key={c.name}
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-xs font-bold" style={{ color: '#e6edf3' }}>{c.name}</div>
                              <div className="text-[10px]" style={{ color: '#4a6278' }}>{c.neighborhood}</div>
                            </div>
                            <span className="text-[10px] font-black" style={{ color: c.progress > 50 ? '#22c55e' : '#fbbf24' }}>{c.progress}%</span>
                          </div>
                          <div className="w-full rounded-full overflow-hidden mb-2" style={{ height: 4, background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: c.progress > 50 ? '#22c55e' : '#fbbf24' }} />
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span style={{ color: '#4a6278' }}>{c.tasksLeft} tasks left</span>
                            <span style={{ color: c.sponsor ? '#fbbf24' : '#f87171' }}>
                              {c.sponsor ? `Funded by ${c.sponsor}` : c.budget}
                            </span>
                          </div>
                        </div>
                      ))}
                      <Link
                        href="/admin/tasks/create"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition-all hover:bg-white/5 mt-1"
                        style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#7d8fa1', borderStyle: 'dashed' }}
                      >
                        + Start a new campaign
                      </Link>
                    </div>
                  )}

                  {/* ── ACTIVITY ── */}
                  {rightTab === 'activity' && (
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: '#4a6278' }}>Live from LA</p>
                      {ACTIVITY_FEED.map((item, i) => (
                        <div
                          key={i}
                          className="flex gap-3 px-3 py-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 4 }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: item.amount ? '#22c55e' : '#fbbf24' }} />
                            {i < ACTIVITY_FEED.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.06)' }} />}
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="text-xs leading-snug" style={{ color: '#c9d1d9' }}>{item.text}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px]" style={{ color: '#4a6278' }}>{item.neighborhood}</span>
                              <span style={{ color: '#4a6278' }}>·</span>
                              <span className="text-[10px]" style={{ color: '#4a6278' }}>{item.time}</span>
                              {item.amount !== null && (
                                <span className="text-[10px] font-bold" style={{ color: '#22c55e' }}>+${item.amount}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
