'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CivicTreeLogo from '@/components/CivicTreeLogo';
import { useHydrated } from '@/lib/demo/hooks';
import { campaignProgress, neighborhoodImpact, workerBalances } from '@/lib/demo/selectors';
import { createSeedState } from '@/lib/demo/seed';
import { useDemoStore } from '@/lib/demo/store';
import type { Campaign, DemoState, Neighborhood as DemoNeighborhood } from '@/lib/demo/types';
import {
  MapPin, TrendingUp, Users, DollarSign, Activity,
  CheckSquare, Award, ArrowRight, Flag, Target,
  BarChart2, Zap, X, ChevronRight, Shield,
  Map, Home, Eye, Camera, ClipboardCheck, Clock, Play, Pause, Radio, Bell
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type NeighborhoodState = 'needs-care' | 'active' | 'improving' | 'thriving' | 'fully-stewarded';
type RightTab = 'overview' | 'leaderboards' | 'campaigns' | 'activity' | 'workers' | 'review' | 'sponsor';
type DashboardView = 'overview' | 'map' | 'campaigns' | 'leaderboards' | 'activity' | 'workers' | 'review' | 'sponsor' | 'impact-roi';

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

const NEIGHBORHOOD_STATE_BY_LABEL: Record<string, NeighborhoodState> = {
  'Needs Care': 'needs-care',
  Active: 'active',
  Improving: 'improving',
  Thriving: 'thriving',
  'Fully Stewarded': 'fully-stewarded',
};

const DEFAULT_STATE_PROGRESS: Record<NeighborhoodState, number> = {
  'needs-care': 12,
  active: 35,
  improving: 58,
  thriving: 82,
  'fully-stewarded': 95,
};

function formatShortName(name: string) {
  if (name === 'Koreatown') return 'K-Town';
  return name.length > 12 ? name.split(' ')[0] : name;
}

function normalizeNeighborhoodState(state: string): NeighborhoodState {
  return NEIGHBORHOOD_STATE_BY_LABEL[state] ?? 'active';
}

function findNeighborhoodCampaign(state: DemoState, neighborhoodId: string): Campaign | null {
  const campaignId = state.tasks.find(task => task.neighborhoodId === neighborhoodId && task.campaignId)?.campaignId;
  return state.campaigns.find(campaign => campaign.id === campaignId) ?? null;
}

function buildNeighborhoodTile(base: Neighborhood, demoNeighborhood: DemoNeighborhood | undefined, state: DemoState): Neighborhood {
  if (!demoNeighborhood) return base;

  const liveState = normalizeNeighborhoodState(demoNeighborhood.state);
  const campaign = findNeighborhoodCampaign(state, demoNeighborhood.id);
  const sponsor = campaign
    ? state.sponsors.find(item => item.campaignIds.includes(campaign.id))?.name ?? base.sponsor
    : base.sponsor;
  const openTasks = state.tasks.filter(task => task.neighborhoodId === demoNeighborhood.id && task.status === 'open').length;
  const progress = campaign
    ? campaignProgress(state, campaign.id)
    : Math.min(95, Math.max(DEFAULT_STATE_PROGRESS[liveState], demoNeighborhood.level * 18 + demoNeighborhood.blocksImproved));

  return {
    ...base,
    name: demoNeighborhood.name,
    shortName: formatShortName(demoNeighborhood.name),
    level: demoNeighborhood.level,
    state: liveState,
    progress,
    tasksCompleted: demoNeighborhood.tasksCompleted,
    dollarsPaid: demoNeighborhood.paidTotal,
    blocksImproved: demoNeighborhood.blocksImproved,
    openTasks,
    reports: demoNeighborhood.openReports,
    campaign: campaign?.title ?? base.campaign,
    sponsor,
    description: campaign
      ? `${campaign.title} is active here with ${campaign.completedGoal} of ${campaign.targetGoal} goals complete.`
      : base.description,
  };
}

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
  { time: '31m ago', text: 'Report verified on 7th & Main',                   neighborhood: 'Downtown',    amount: 12 },
  { time: '45m ago', text: 'Trash cleared near Culver City Arts Center',      neighborhood: 'Culver City', amount: 22 },
  { time: '1h ago',  text: 'New crew formed: Soto Street Crew',               neighborhood: 'Boyle Hts',   amount: null },
  { time: '1h ago',  text: '$810 paid out to James M.',                       neighborhood: 'Culver City', amount: null },
];

const BUSINESS_VALUE_TILES = [
  { label: 'More foot traffic', detail: 'Cleaner corridors invite customers to stay, shop, and return.', icon: TrendingUp, color: '#34d399' },
  { label: 'Cleaner corridors', detail: 'Visible maintenance turns sponsor budgets into neighborhood trust.', icon: Shield, color: '#60a5fa' },
  { label: 'Higher tenant appeal', detail: 'Well-kept blocks help property groups defend occupancy and rents.', icon: Home, color: '#c4b5fd' },
  { label: 'Verified sponsor ROI', detail: 'Every funded task carries proof, location, payout, and impact data.', icon: CheckSquare, color: '#fbbf24' },
  { label: 'Lower admin overhead', detail: 'One workflow replaces ad hoc intake, dispatch, verification, and reporting.', icon: Activity, color: '#f87171' },
];

const REVENUE_MODEL_ITEMS = [
  '15 to 25 percent task take rate on funded local work',
  'SaaS dashboards for cities, BIDs, and property groups',
  'Campaign fees for sponsors funding corridors and events',
  'Verification and reporting fees for proof-backed outcomes',
];

const SCALE_SCENARIOS = [
  { districts: '10', spend: '$10M', takeRate: '15%', revenue: '$1.5M' },
  { districts: '50', spend: '$50M', takeRate: '15%', revenue: '$7.5M' },
  { districts: '250', spend: '$250M', takeRate: '15%', revenue: '$37.5M' },
  { districts: '1,000', spend: '$1B+', takeRate: '15%', revenue: '$150M+' },
];

const DEMO_WORKFLOW_STEPS = [
  { label: 'Worker flow', detail: 'Someone reports and completes local work.', icon: MapPin },
  { label: 'Admin review', detail: 'Proof is verified before payout.', icon: CheckSquare },
  { label: 'Sponsor impact', detail: 'Funders see visible outcomes.', icon: Zap },
  { label: 'Impact & ROI', detail: 'Investors see why this can scale.', icon: BarChart2 },
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
  { label: 'Command Center', href: '/dashboard?view=overview', icon: Home, view: 'overview' },
  { label: 'LA Map',         href: '/dashboard?view=map',      icon: Map, view: 'map' },
  { label: 'Campaigns',      href: '/dashboard?view=campaigns', icon: Flag, view: 'campaigns' },
  { label: 'Leaderboards',   href: '/dashboard?view=leaderboards', icon: Award, view: 'leaderboards' },
  { label: 'Workers',        href: '/dashboard?view=workers', icon: Users, view: 'workers' },
  { label: 'Review',         href: '/dashboard?view=review', icon: CheckSquare, view: 'review' },
  { label: 'Sponsor View',   href: '/dashboard?view=sponsor', icon: Zap, view: 'sponsor' },
  { label: 'Impact & ROI',   href: '/dashboard?view=impact-roi', icon: BarChart2, view: 'impact-roi' },
] satisfies Array<{ label: string; href: string; icon: typeof Home; view: DashboardView }>;

const RIGHT_TAB_LINKS: Array<{ label: string; tab: RightTab; href: string }> = [
  { label: 'Overview', tab: 'overview', href: '/dashboard?view=overview' },
  { label: 'Leaderboards', tab: 'leaderboards', href: '/dashboard?view=leaderboards' },
  { label: 'Campaigns', tab: 'campaigns', href: '/dashboard?view=campaigns' },
  { label: 'Activity', tab: 'activity', href: '/dashboard?view=activity' },
];

function parseDashboardView(value: string | null): DashboardView {
  if (
    value === 'map' ||
    value === 'campaigns' ||
    value === 'leaderboards' ||
    value === 'activity' ||
    value === 'workers' ||
    value === 'review' ||
    value === 'sponsor' ||
    value === 'impact-roi'
  ) return value;
  return 'overview';
}

function viewToRightTab(view: DashboardView): RightTab {
  if (view === 'leaderboards') return 'leaderboards';
  if (view === 'campaigns') return 'campaigns';
  if (view === 'activity') return 'activity';
  if (view === 'workers') return 'workers';
  if (view === 'review') return 'review';
  if (view === 'sponsor') return 'sponsor';
  if (view === 'impact-roi') return 'sponsor';
  return 'overview';
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c1118]" />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeView = parseDashboardView(searchParams.get('view'));
  const rightTab = viewToRightTab(activeView);
  const hydrated = useHydrated();
  const demoState = useDemoStore();
  const reviewSubmission = useDemoStore((s) => s.reviewSubmission);
  const simulateOpsEvent = useDemoStore((s) => s.simulateOpsEvent);
  const [seedState] = useState(() => createSeedState());
  const displayState = hydrated ? demoState : seedState;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [opsRunning, setOpsRunning] = useState(true);
  const [opsSpeed, setOpsSpeed] = useState(6500);
  const [opsPulse, setOpsPulse] = useState(0);
  const [opsLog, setOpsLog] = useState<string[]>(['Live ops simulator ready.']);
  const demoNeighborhoods = neighborhoodImpact(displayState);
  const neighborhoods = NEIGHBORHOODS.map(base =>
    buildNeighborhoodTile(base, demoNeighborhoods.find(n => n.id === base.id), displayState),
  );
  const selected = neighborhoods.find(n => n.id === selectedId) ?? null;

  const handleTileClick = (n: Neighborhood) => {
    setSelectedId(prev => prev === n.id ? null : n.id);
  };

  const pushOpsEvent = (source: string) => {
    simulateOpsEvent();
    setOpsPulse((current) => current + 1);
    setOpsLog((current) => [
      `${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })} ${source}`,
      ...current,
    ].slice(0, 6));
  };

  useEffect(() => {
    if (!hydrated || !opsRunning) return;
    const timer = window.setInterval(() => {
      simulateOpsEvent();
      setOpsPulse((current) => current + 1);
      setOpsLog((current) => [
        `${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })} Auto event added`,
        ...current,
      ].slice(0, 6));
    }, opsSpeed);
    return () => window.clearInterval(timer);
  }, [hydrated, opsRunning, opsSpeed, simulateOpsEvent]);

  const openTaskCount = displayState.tasks.filter(task => task.status === 'open').length;
  const submittedTaskCount = displayState.tasks.filter(task => task.status === 'submitted').length;
  const pendingPaymentTotal = displayState.payments
    .filter(payment => payment.status === 'pending_review')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const reportCount = displayState.reports.length;
  const pendingReviewCount = displayState.submissions.filter(submission => submission.status === 'submitted').length;
  const totalBlocksImproved = demoNeighborhoods.reduce((s, n) => s + n.blocksImproved, 0);
  const needsCare = neighborhoods.filter(n => n.state === 'needs-care');
  const totalOpenTasks = openTaskCount;
  const totalReports   = demoNeighborhoods.reduce((s, n) => s + n.openReports, 0) || reportCount;
  const topStats = [
    { label: 'Open tasks',       value: openTaskCount.toString(),           icon: CheckSquare, color: '#22c55e' },
    { label: 'Pending payout',   value: `$${pendingPaymentTotal}`,          icon: DollarSign,  color: '#34d399' },
    { label: 'Blocks improved',  value: totalBlocksImproved.toString(),     icon: TrendingUp,  color: '#60a5fa' },
    { label: 'Open reports',     value: reportCount.toString(),             icon: Activity,    color: '#f87171' },
    { label: 'Reviews pending',  value: pendingReviewCount.toString(),      icon: Eye,         color: '#fbbf24' },
    { label: 'Submitted tasks',  value: submittedTaskCount.toString(),      icon: Users,       color: '#c4b5fd' },
  ];
  const workerRows = displayState.workers.map(worker => {
    const balances = workerBalances(displayState, worker.id);
    const claims = displayState.claims.filter(claim => claim.workerId === worker.id);
    const submissions = displayState.submissions.filter(submission => submission.workerId === worker.id);
    return {
      worker,
      balances,
      activeClaims: claims.filter(claim => claim.status === 'claimed' || claim.status === 'in_progress').length,
      approved: submissions.filter(submission => submission.status === 'approved').length,
      pending: submissions.filter(submission => submission.status === 'submitted').length,
    };
  });
  const pendingReviewRows = displayState.submissions
    .filter(submission => submission.status === 'submitted')
    .map(submission => ({
      submission,
      task: displayState.tasks.find(task => task.id === submission.taskId),
      worker: displayState.workers.find(worker => worker.id === submission.workerId),
      claim: displayState.claims.find(claim => claim.id === submission.claimId),
      payment: displayState.payments.find(payment => payment.submissionId === submission.id),
    }));
  const sponsorRows = displayState.campaigns.map(campaign => ({
    campaign,
    sponsor: displayState.sponsors.find(sponsor => sponsor.id === campaign.sponsorId),
    progress: campaignProgress(displayState, campaign.id),
  }));
  const fundedTotal = displayState.campaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0);
  const remainingSponsorBudget = displayState.campaigns.reduce((sum, campaign) => sum + campaign.remainingBudget, 0);
  const liveOpsFeed = [
    ...displayState.submissions
      .filter(submission => submission.status === 'submitted')
      .slice(-4)
      .map(submission => {
        const task = displayState.tasks.find(item => item.id === submission.taskId);
        const worker = displayState.workers.find(item => item.id === submission.workerId);
        return {
          id: `sub-${submission.id}`,
          label: 'Proof submitted',
          text: task?.title ?? 'Worker proof submitted',
          meta: `${worker?.name ?? 'Worker'} sent proof for admin approval`,
          color: '#fbbf24',
        };
      }),
    ...displayState.reports
      .filter(report => report.status === 'pending')
      .slice(-4)
      .map(report => ({
        id: `report-${report.id}`,
        label: 'Resident report',
        text: report.note,
        meta: `${report.category} waiting for triage`,
        color: '#f87171',
      })),
    ...displayState.tasks
      .filter(task => task.status === 'open' && !task.isComingSoon && !task.isFundingNeeded)
      .slice(-4)
      .map(task => ({
        id: `task-${task.id}`,
        label: 'Open paid task',
        text: task.title,
        meta: `$${task.payoutAmount} available for workers`,
        color: '#34d399',
      })),
  ].slice(0, 8);

  return (
    <div className="dashboard-root flex min-h-screen overflow-hidden" style={{ background: '#0c1118', color: '#e6edf3', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-[210px] shrink-0 flex flex-col border-r" style={{ background: '#10181f', borderColor: 'rgba(255,255,255,0.07)' }}>
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <Link href="/" aria-label="CivicTree home" className="mb-1 inline-flex">
            <CivicTreeLogo size="sm" tone="dark" className="h-8 w-[106px]" />
          </Link>
          <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: '#4a6278' }}>Command Center</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV_LINKS.map(({ label, href, icon: Icon, view }) => {
            const active = view ? activeView === view : false;
            return (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                color: active ? '#22c55e' : '#7d8fa1',
                background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
            );
          })}
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
            <span className="text-[11px] font-bold" style={{ color: '#22c55e' }}>{hydrated ? 'Live' : 'Loading'}</span>
          </div>
          {topStats.map(({ label, value, icon: Icon, color }) => (
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
            <Link href="/dashboard?view=review" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style={{ background: '#22c55e', color: '#0c1118' }}>
              <CheckSquare size={12} />
              Review Queue
            </Link>
          </div>
        </header>

        {/* Content: Workspace + Right panel */}
        <div className="flex flex-1 overflow-hidden">

          {/* Main workspace */}
          <main className="flex-1 overflow-auto p-6">
            {activeView === 'overview' && (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#22c55e' }}>Command Center</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#e6edf3' }}>Los Angeles operating picture</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: '#7d8fa1' }}>City health, reviews, funding, and worker capacity in one admin view.</p>
                </div>

                <section className="grid gap-4 rounded-xl p-5 xl:grid-cols-[1fr_1.2fr]" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(255,255,255,0.035) 45%, rgba(251,191,36,0.08))', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(34,197,94,0.16)', color: '#34d399' }}>
                        <Radio size={18} />
                      </span>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>Live ops mini-game</p>
                        <h2 className="text-xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Incoming city activity simulator</h2>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed" style={{ color: '#a9b8c6' }}>
                      Jobs, reports, and worker proof packets arrive automatically. Keep the review queue moving while new activity keeps coming in.
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <MetricTile label="Ops pulses" value={opsPulse.toString()} />
                      <MetricTile label="Queue" value={pendingReviewCount.toString()} />
                      <MetricTile label="Backlog" value={(openTaskCount + totalReports).toString()} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setOpsRunning((current) => !current)}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all hover:opacity-90"
                        style={{ background: opsRunning ? 'rgba(251,191,36,0.16)' : '#22c55e', color: opsRunning ? '#fbbf24' : '#0c1118', border: opsRunning ? '1px solid rgba(251,191,36,0.28)' : '1px solid #22c55e' }}
                      >
                        {opsRunning ? <Pause size={14} /> : <Play size={14} />}
                        {opsRunning ? 'Pause sim' : 'Start sim'}
                      </button>
                      <button
                        type="button"
                        onClick={() => pushOpsEvent('Manual dispatch')}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all hover:opacity-90"
                        style={{ background: 'rgba(96,165,250,0.16)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.28)' }}
                      >
                        <Bell size={14} />
                        Send event
                      </button>
                      <div className="inline-flex overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {[
                          { label: 'Slow', value: 9000 },
                          { label: 'Live', value: 6500 },
                          { label: 'Rush', value: 3500 },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setOpsSpeed(item.value)}
                            className="px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all"
                            style={{
                              background: opsSpeed === item.value ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.03)',
                              color: opsSpeed === item.value ? '#34d399' : '#7d8fa1',
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl p-4" style={{ background: 'rgba(12,17,24,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#7d8fa1' }}>Incoming feed</p>
                      <div className="mt-3 grid max-h-64 gap-2 overflow-auto pr-1">
                        {liveOpsFeed.map((item) => (
                          <div key={item.id} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: item.color }}>{item.label}</span>
                            </div>
                            <p className="mt-2 text-xs font-bold leading-snug" style={{ color: '#e6edf3' }}>{item.text}</p>
                            <p className="mt-1 text-[10px]" style={{ color: '#7d8fa1' }}>{item.meta}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl p-4" style={{ background: 'rgba(12,17,24,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#7d8fa1' }}>Admin pressure log</p>
                      <div className="mt-3 grid gap-2">
                        {opsLog.map((item, index) => (
                          <div key={`${item}-${index}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold" style={{ background: 'rgba(255,255,255,0.035)', color: '#c9d1d9' }}>
                            <Activity size={12} style={{ color: '#34d399' }} />
                            {item}
                          </div>
                        ))}
                      </div>
                      <Link href="/dashboard?view=review" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition-all hover:opacity-90" style={{ background: pendingReviewCount > 0 ? '#fbbf24' : 'rgba(34,197,94,0.16)', color: pendingReviewCount > 0 ? '#0c1118' : '#34d399' }}>
                        <Eye size={14} />
                        Work the review queue
                      </Link>
                    </div>
                  </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-4">
                  {[
                    { label: 'Open work', value: openTaskCount, detail: `$${displayState.tasks.filter(task => task.status === 'open' && !task.isFundingNeeded && !task.isComingSoon).reduce((sum, task) => sum + task.payoutAmount, 0)} worker pay live`, icon: CheckSquare, color: '#22c55e' },
                    { label: 'Needs care', value: needsCare.length, detail: `${totalReports} reports across LA`, icon: Activity, color: '#f87171' },
                    { label: 'Pending review', value: pendingReviewCount, detail: `$${pendingPaymentTotal} waiting on approval`, icon: Eye, color: '#fbbf24' },
                    { label: 'Sponsor pools', value: sponsorRows.length, detail: `$${remainingSponsorBudget.toLocaleString()} remaining`, icon: Zap, color: '#c4b5fd' },
                  ].map(({ label, value, detail, icon: Icon, color }) => (
                    <div key={label} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#4a6278' }}>{label}</p>
                        <Icon size={17} style={{ color }} />
                      </div>
                      <div className="mt-4 text-3xl font-black" style={{ color, fontFamily: "'Outfit', sans-serif" }}>{value}</div>
                      <p className="mt-1 text-xs" style={{ color: '#7d8fa1' }}>{detail}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                  <section className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Priority zones</h2>
                        <p className="text-xs" style={{ color: '#7d8fa1' }}>Click a row to inspect the zone on the right.</p>
                      </div>
                      <Link href="/dashboard?view=map" className="text-xs font-black" style={{ color: '#22c55e' }}>Open map</Link>
                    </div>
                    <div className="grid gap-3">
                      {needsCare.map(n => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => setSelectedId(n.id)}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl px-4 py-3 text-left transition hover:bg-white/5"
                          style={{ background: selected?.id === n.id ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.025)', border: '1px solid rgba(239,68,68,0.22)' }}
                        >
                          <span>
                            <span className="block text-sm font-black" style={{ color: '#e6edf3' }}>{n.name}</span>
                            <span className="mt-1 block text-xs" style={{ color: '#7d8fa1' }}>{n.description}</span>
                          </span>
                          <span className="text-right text-xs" style={{ color: '#fca5a5' }}>{n.openTasks} tasks<br />{n.reports} reports</span>
                          <ChevronRight size={16} style={{ color: '#f87171' }} />
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.14)' }}>
                    <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Today flow</h2>
                    <div className="mt-4 flex flex-col gap-3">
                      {ACTIVITY_FEED.slice(0, 5).map(item => (
                        <div key={`${item.time}-${item.text}`} className="flex items-start justify-between gap-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.035)' }}>
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#e6edf3' }}>{item.text}</p>
                            <p className="mt-1 text-[10px]" style={{ color: '#7d8fa1' }}>{item.neighborhood} · {item.time}</p>
                          </div>
                          {item.amount !== null && <span className="text-xs font-black" style={{ color: '#22c55e' }}>+${item.amount}</span>}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeView === 'campaigns' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#fbbf24' }}>Campaigns</p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Budgets, sponsors, and active work</h1>
                    <p className="mt-2 text-sm" style={{ color: '#7d8fa1' }}>Track funded initiatives and where admin action can unlock more care.</p>
                  </div>
                  <Link href="/admin/tasks/create" className="rounded-xl px-4 py-3 text-xs font-black" style={{ background: '#22c55e', color: '#0c1118' }}>Create task</Link>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {sponsorRows.map(({ campaign, sponsor, progress }) => (
                    <section key={campaign.id} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>{campaign.title}</h2>
                          <p className="mt-1 text-xs" style={{ color: '#7d8fa1' }}>{sponsor?.name ?? 'Unassigned sponsor'}</p>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: progress >= 50 ? 'rgba(34,197,94,0.14)' : 'rgba(251,191,36,0.14)', color: progress >= 50 ? '#34d399' : '#fbbf24' }}>{progress}%</span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed" style={{ color: '#c9d1d9' }}>{campaign.description}</p>
                      <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress >= 50 ? '#34d399' : '#fbbf24' }} />
                      </div>
                      <div className="mt-5 grid grid-cols-4 gap-3 text-xs">
                        <MetricTile label="Goals" value={`${campaign.completedGoal}/${campaign.targetGoal}`} />
                        <MetricTile label="Budget" value={`$${campaign.totalBudget}`} />
                        <MetricTile label="Left" value={`$${campaign.remainingBudget}`} />
                        <MetricTile label="Open tasks" value={displayState.tasks.filter(task => task.campaignId === campaign.id && task.status === 'open').length.toString()} />
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'leaderboards' && (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#60a5fa' }}>Leaderboards</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Who is moving the city</h1>
                </div>
                <div className="grid gap-5 xl:grid-cols-3">
                  <LeaderboardColumn title="Workers" rows={LEADERBOARD_WORKERS.map(w => ({ name: w.name, meta: `${w.neighborhood} · ${w.tasks} tasks`, value: `$${w.earned}` }))} />
                  <LeaderboardColumn title="Crews" rows={LEADERBOARD_CREWS.map(c => ({ name: c.name, meta: `${c.neighborhood} · ${c.members} members`, value: `${c.tasks}` }))} />
                  <LeaderboardColumn title="Neighborhoods" rows={[...neighborhoods].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 5).map(n => ({ name: n.name, meta: `${n.blocksImproved} blocks · $${n.dollarsPaid.toLocaleString()} paid`, value: `Lv ${n.level}` }))} />
                </div>
              </div>
            )}

            {activeView === 'workers' && (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#60a5fa' }}>Workers</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Worker operations</h1>
                  <p className="mt-2 text-sm" style={{ color: '#7d8fa1' }}>Profiles, earnings, reliability, onboarding, and task history.</p>
                </div>
                <div className="grid gap-4">
                  {workerRows.map(({ worker, balances, activeClaims, approved, pending }) => (
                    <section key={worker.id} className="grid gap-4 rounded-xl p-5 xl:grid-cols-[1.1fr_1fr_1fr_auto]" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                        <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>{worker.name}</h2>
                        <p className="mt-1 text-xs" style={{ color: '#7d8fa1' }}>Level {worker.level} · {worker.neighborhoodId}</p>
                        <span className="mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black" style={{ background: worker.onboardingCompleted ? 'rgba(34,197,94,0.14)' : 'rgba(251,191,36,0.14)', color: worker.onboardingCompleted ? '#34d399' : '#fbbf24' }}>
                          {worker.onboardingCompleted ? 'Onboarded' : 'Needs onboarding'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <MetricTile label="Reliability" value={`${worker.reliabilityScore}%`} />
                        <MetricTile label="Safety" value={`${worker.safetyScore}%`} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <MetricTile label="Available" value={`$${balances.available}`} />
                        <MetricTile label="Pending" value={`$${balances.pending}`} />
                        <MetricTile label="Lifetime" value={`$${balances.lifetime}`} />
                      </div>
                      <div className="flex flex-col justify-center text-right text-xs" style={{ color: '#7d8fa1' }}>
                        <span>{activeClaims} active</span>
                        <span>{pending} pending</span>
                        <span>{approved} approved</span>
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'review' && (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#fbbf24' }}>Review</p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Approval queue</h1>
                  <p className="mt-2 text-sm" style={{ color: '#7d8fa1' }}>Reports and proof submissions waiting for an admin decision.</p>
                </div>
                <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                  <section className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Proof submissions</h2>
                    <div className="mt-4 grid gap-3">
                      {pendingReviewRows.length === 0 ? (
                        <p className="rounded-xl p-4 text-sm" style={{ background: 'rgba(34,197,94,0.08)', color: '#34d399' }}>No submissions waiting.</p>
                      ) : pendingReviewRows.map(({ submission, task, worker, claim, payment }) => (
                        <div key={submission.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black">{task?.title ?? 'Unknown task'}</p>
                              <p className="mt-1 text-xs" style={{ color: '#7d8fa1' }}>{worker?.name ?? 'Unknown worker'} to admin review from Worker App</p>
                            </div>
                            <span className="text-sm font-black" style={{ color: '#34d399' }}>${payment?.amount ?? task?.payoutAmount ?? 0}</span>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {[
                              { label: 'Before', src: submission.beforePhoto, icon: Camera },
                              { label: 'After', src: submission.afterPhoto, icon: Camera },
                            ].map(({ label, src, icon: Icon }) => (
                              <div key={label} className="overflow-hidden rounded-xl" style={{ background: 'rgba(12,17,24,0.62)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider" style={{ color: '#7d8fa1' }}>
                                  <Icon size={12} />
                                  {label}
                                </div>
                                <img src={src} alt={`${label} proof`} className="h-24 w-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {[
                              { label: 'GPS verified', value: claim?.gpsCheckin ? 'Within task zone' : 'Demo fallback', icon: MapPin, color: '#34d399' },
                              { label: 'Time stamped', value: new Date(submission.submittedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), icon: Clock, color: '#60a5fa' },
                              { label: 'Checklist', value: task?.doList.length ? `${Math.min(task.doList.length, 4)} items confirmed` : 'Requirements confirmed', icon: ClipboardCheck, color: '#fbbf24' },
                              { label: 'AI review', value: '96% confidence', icon: Eye, color: '#c4b5fd' },
                            ].map(({ label, value, icon: Icon, color }) => (
                              <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center gap-2">
                                  <Icon size={13} style={{ color }} />
                                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#7d8fa1' }}>{label}</span>
                                </div>
                                <p className="mt-1 text-xs font-bold" style={{ color: '#c9d1d9' }}>{value}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mt-3 text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>{submission.notes || 'No notes submitted.'}</p>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => reviewSubmission(submission.id, 'reject', { reason: 'Needs clearer proof' })}
                              className="rounded-xl px-3 py-2 text-xs font-black transition-all hover:opacity-90"
                              style={{ background: 'rgba(248,113,113,0.14)', color: '#fca5a5', border: '1px solid rgba(248,113,113,0.28)' }}
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewSubmission(submission.id, 'approve', { approvedAmount: payment?.amount ?? task?.payoutAmount })}
                              className="rounded-xl px-3 py-2 text-xs font-black transition-all hover:opacity-90"
                              style={{ background: '#22c55e', color: '#0c1118' }}
                            >
                              Approve and release
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Citizen reports</h2>
                    <div className="mt-4 grid gap-3">
                      {displayState.reports.map(report => (
                        <div key={report.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black capitalize">{report.category}</p>
                              <p className="mt-1 text-xs" style={{ color: '#7d8fa1' }}>{report.note}</p>
                            </div>
                            <span className="rounded-full px-2 py-1 text-[10px] font-black" style={{ background: report.status === 'pending' ? 'rgba(251,191,36,0.14)' : 'rgba(96,165,250,0.14)', color: report.status === 'pending' ? '#fbbf24' : '#60a5fa' }}>{report.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeView === 'sponsor' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#c4b5fd' }}>Sponsor View</p>
                    <h1 className="mt-1 text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Funding pools and proof of impact</h1>
                    <p className="mt-2 text-sm" style={{ color: '#7d8fa1' }}>Verified outcomes become the business case once the task loop is proven.</p>
                  </div>
                  <Link href="/dashboard?view=impact-roi" className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition-all hover:opacity-90" style={{ background: '#c4b5fd', color: '#0c1118' }}>
                    <BarChart2 size={14} />
                    View ROI report
                  </Link>
                </div>
                <div className="grid gap-4 xl:grid-cols-3">
                  <MetricCard label="Funded" value={`$${fundedTotal.toLocaleString()}`} icon={DollarSign} color="#34d399" />
                  <MetricCard label="Remaining" value={`$${remainingSponsorBudget.toLocaleString()}`} icon={Zap} color="#fbbf24" />
                  <MetricCard label="Verified blocks" value={totalBlocksImproved.toString()} icon={Shield} color="#c4b5fd" />
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {sponsorRows.map(({ campaign, sponsor, progress }) => (
                    <section key={campaign.id} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>{campaign.title}</h2>
                          <p className="mt-1 text-xs" style={{ color: '#7d8fa1' }}>{sponsor?.name ?? 'Unassigned sponsor'}</p>
                        </div>
                        <span className="text-sm font-black" style={{ color: '#34d399' }}>{progress}%</span>
                      </div>
                      <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: '#34d399' }} />
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <MetricTile label="Goals" value={`${campaign.completedGoal}/${campaign.targetGoal}`} />
                        <MetricTile label="Paid proof" value={`$${campaign.totalBudget - campaign.remainingBudget}`} />
                        <MetricTile label="Pool left" value={`$${campaign.remainingBudget}`} />
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'impact-roi' && (
              <div className="flex flex-col gap-6">
                <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                  <section className="overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.13), rgba(255,255,255,0.035) 42%, rgba(96,165,250,0.08))', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="grid gap-6 p-6 xl:grid-cols-[1fr_280px]">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>Impact & ROI</p>
                        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif", color: '#f4fbf7' }}>
                          CivicTree turns local cleanup into measurable value.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: '#a9b8c6' }}>
                          The demo loop proves the product works: residents report and complete tasks, admins verify proof, and sponsors see validated impact. This page shows how that loop becomes a marketplace for local maintenance spend.
                        </p>
                      </div>
                      <div className="rounded-xl p-5" style={{ background: 'rgba(12,17,24,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#7d8fa1' }}>Investor conclusion</p>
                        <p className="mt-4 text-3xl font-black leading-tight" style={{ color: '#34d399', fontFamily: "'Outfit', sans-serif" }}>$150M</p>
                        <p className="mt-2 text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>
                          If CivicTree processes $1B in local maintenance spend at a 15 percent take rate, that is $150M annual revenue before SaaS and campaign fees.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 border-t p-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      {BUSINESS_VALUE_TILES.map(({ label, detail, icon: Icon, color }) => (
                        <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(12,17,24,0.42)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <Icon size={18} style={{ color }} />
                          <h2 className="mt-4 text-sm font-black" style={{ color: '#e6edf3', fontFamily: "'Outfit', sans-serif" }}>{label}</h2>
                          <p className="mt-2 text-[11px] leading-relaxed" style={{ color: '#7d8fa1' }}>{detail}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Impact at a glance</h2>
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#7d8fa1' }}>This year</span>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {[
                        { label: 'Blocks improved', value: totalBlocksImproved.toLocaleString(), icon: Shield, color: '#34d399' },
                        { label: 'Tasks completed', value: displayState.tasks.filter(task => task.status === 'approved').length.toLocaleString(), icon: CheckSquare, color: '#60a5fa' },
                        { label: 'Local economic impact', value: '$2.3M', icon: TrendingUp, color: '#fbbf24' },
                        { label: 'Sponsor pools active', value: sponsorRows.length.toString(), icon: Zap, color: '#c4b5fd' },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}1f` }}>
                            <Icon size={17} style={{ color }} />
                          </span>
                          <span>
                            <span className="block text-lg font-black leading-none" style={{ color, fontFamily: "'Outfit', sans-serif" }}>{value}</span>
                            <span className="mt-1 block text-[10px]" style={{ color: '#7d8fa1' }}>{label}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                  <section className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>Revenue model</p>
                    <h2 className="mt-2 text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Multi-sided maintenance revenue</h2>
                    <div className="mt-5 grid gap-3">
                      {REVENUE_MODEL_ITEMS.map((item, index) => (
                        <div key={item} className="flex gap-3 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black" style={{ background: index === 0 ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)', color: index === 0 ? '#34d399' : '#7d8fa1' }}>
                            {index + 1}
                          </span>
                          <p className="text-sm leading-relaxed" style={{ color: '#c9d1d9' }}>{item}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#60a5fa' }}>Scale table</p>
                        <h2 className="mt-2 text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>Revenue modeling scenarios</h2>
                      </div>
                      <p className="text-xs" style={{ color: '#7d8fa1' }}>Illustrative projection based on districts onboarded and platform take rate.</p>
                    </div>
                    <div className="mt-5 overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="grid grid-cols-4 gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.04)', color: '#7d8fa1' }}>
                        <span>Districts</span>
                        <span>Annual spend</span>
                        <span>Take rate</span>
                        <span>Revenue</span>
                      </div>
                      {SCALE_SCENARIOS.map((row) => (
                        <div key={row.districts} className="grid grid-cols-4 gap-3 border-t px-4 py-4 text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#c9d1d9' }}>
                          <span className="font-black">{row.districts}</span>
                          <span>{row.spend}</span>
                          <span>{row.takeRate}</span>
                          <span className="font-black" style={{ color: '#34d399' }}>{row.revenue}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[11px] leading-relaxed" style={{ color: '#7d8fa1' }}>
                      Conservative estimates exclude premium SaaS, campaign, reporting, and data products.
                    </p>
                  </section>
                </div>

                <section className="rounded-xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.16)' }}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#34d399' }}>Where this fits in the demo workflow</p>
                      <h2 className="mt-2 text-xl font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>The final proof page after the loop works</h2>
                    </div>
                    <Link href="/dashboard?view=sponsor" className="inline-flex items-center gap-2 text-xs font-black" style={{ color: '#34d399' }}>
                      Back to sponsor impact
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    {DEMO_WORKFLOW_STEPS.map(({ label, detail, icon: Icon }, index) => (
                      <div key={label} className="rounded-xl p-4" style={{ background: index === 3 ? 'rgba(34,197,94,0.13)' : 'rgba(255,255,255,0.03)', border: `1px solid ${index === 3 ? 'rgba(34,197,94,0.32)' : 'rgba(255,255,255,0.07)'}` }}>
                        <div className="flex items-center justify-between">
                          <Icon size={18} style={{ color: index === 3 ? '#34d399' : '#7d8fa1' }} />
                          <span className="text-[10px] font-black" style={{ color: '#4a6278' }}>{index + 1}</span>
                        </div>
                        <h3 className="mt-4 text-sm font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>{label}</h3>
                        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: '#7d8fa1' }}>{detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeView === 'activity' && (
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Live activity</h1>
                {ACTIVITY_FEED.map(item => (
                  <div key={`${item.time}-${item.text}`} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black">{item.text}</p>
                        <p className="mt-1 text-xs" style={{ color: '#7d8fa1' }}>{item.neighborhood} · {item.time}</p>
                      </div>
                      {item.amount !== null && <span className="text-sm font-black" style={{ color: '#22c55e' }}>+${item.amount}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'map' && (
              <>
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
              {neighborhoods.map(n => {
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
              </>
            )}
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
                    <button onClick={() => setSelectedId(null)} className="p-1 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#4a6278' }}>
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
                      Help this block level up: {100 - selected.progress} points to go.
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
                          <Link href="/dashboard?view=sponsor" className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-80" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
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
                {/* Panel navigation */}
                <div className="shrink-0 border-b p-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="grid grid-cols-2 gap-2">
                  {RIGHT_TAB_LINKS.map(({ label, tab, href }) => (
                    <Link
                      key={tab}
                      href={href}
                      className="rounded-lg px-2.5 py-2 text-center text-[10px] font-black uppercase tracking-wider transition-colors"
                      style={{
                        color: rightTab === tab ? '#d1fae5' : '#7d8fa1',
                        background: rightTab === tab ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${rightTab === tab ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">

                  {/* ── OVERVIEW ── */}
                  {rightTab === 'overview' && (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#22c55e' }}>
                          {activeView === 'map' ? 'LA Map Operations' : 'DTLA Pilot Day 1'}
                        </p>
                        <p className="text-sm font-black leading-snug mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {activeView === 'map' ? 'Use the map to triage zones.' : 'Los Angeles is your game board.'}
                        </p>
                        <p className="text-[11px] leading-relaxed" style={{ color: '#7d8fa1' }}>
                          {activeView === 'map'
                            ? 'Click a neighborhood to inspect reports, open tasks, paid totals, sponsors, and recommended next actions.'
                            : 'Monitor citywide health, pending reviews, funding, and the neighborhoods that need admin attention first.'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: '#4a6278' }}>Zones needing care</p>
                        {needsCare.map(n => (
                          <button
                            key={n.id}
                            onClick={() => setSelectedId(n.id)}
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
                        {[...neighborhoods]
                          .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
                          .slice(0, 3)
                          .map(n => (
                            <button
                              key={n.id}
                              onClick={() => setSelectedId(n.id)}
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

                  {rightTab === 'workers' && (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-xl p-4" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.16)' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#60a5fa' }}>Worker Operations</p>
                        <p className="text-sm font-black leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>Crew readiness, active claims, and payout exposure.</p>
                      </div>

                      {workerRows.map(({ worker, balances, activeClaims, approved, pending }) => (
                        <div
                          key={worker.id}
                          className="rounded-xl p-3"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-black" style={{ color: '#e6edf3' }}>{worker.name}</div>
                              <div className="text-[10px] mt-0.5" style={{ color: '#7d8fa1' }}>
                                Level {worker.level} / {worker.reliabilityScore}% reliability / {worker.safetyScore}% safety
                              </div>
                            </div>
                            <span className="text-[9px] font-black px-2 py-1 rounded-full" style={{ background: worker.onboardingCompleted ? 'rgba(34,197,94,0.14)' : 'rgba(251,191,36,0.13)', color: worker.onboardingCompleted ? '#34d399' : '#fbbf24' }}>
                              {worker.onboardingCompleted ? 'Ready' : 'Onboarding'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.035)' }}>
                              <div className="text-[9px]" style={{ color: '#4a6278' }}>Active</div>
                              <div className="text-xs font-black" style={{ color: '#c9d1d9' }}>{activeClaims}</div>
                            </div>
                            <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.035)' }}>
                              <div className="text-[9px]" style={{ color: '#4a6278' }}>Proofs</div>
                              <div className="text-xs font-black" style={{ color: pending ? '#fbbf24' : '#c9d1d9' }}>{pending} pending</div>
                            </div>
                            <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.035)' }}>
                              <div className="text-[9px]" style={{ color: '#4a6278' }}>Paid work</div>
                              <div className="text-xs font-black" style={{ color: '#34d399' }}>{approved} approved</div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[10px]" style={{ color: '#7d8fa1' }}>
                            <span>${balances.available} available / ${balances.pending} pending</span>
                            <span>${balances.lifetime} lifetime</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {rightTab === 'review' && (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#fbbf24' }}>Proof Review</p>
                        <p className="text-sm font-black leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>{pendingReviewRows.length} submissions need admin decision.</p>
                        <p className="text-[11px] mt-2 leading-relaxed" style={{ color: '#7d8fa1' }}>Use this queue to spot worker, task, payout, and proof-note context before approving from the full review flow.</p>
                      </div>

                      {pendingReviewRows.length === 0 ? (
                        <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', color: '#34d399' }}>
                          Review queue is clear.
                        </div>
                      ) : pendingReviewRows.map(({ submission, task, worker }) => (
                        <div
                          key={submission.id}
                          className="rounded-xl p-3"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-black" style={{ color: '#e6edf3' }}>{task?.title ?? 'Unknown task'}</div>
                              <div className="text-[10px] mt-0.5" style={{ color: '#7d8fa1' }}>
                                {worker?.name ?? 'Unknown worker'} / {task?.neighborhoodId ?? 'No zone'} / {submission.submittedAt}
                              </div>
                            </div>
                            <span className="text-[10px] font-black" style={{ color: '#34d399' }}>${task?.payoutAmount ?? 0}</span>
                          </div>
                          <div className="mt-3 rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: 'rgba(0,0,0,0.16)', color: '#c9d1d9' }}>
                            {submission.notes || 'No notes submitted.'}
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ color: '#7d8fa1' }}>
                            <Shield size={12} style={{ color: '#fbbf24' }} />
                            <span>Before and after proof attached</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {rightTab === 'sponsor' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                          <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#4a6278' }}>Funded</div>
                          <div className="text-lg font-black mt-1" style={{ color: '#34d399', fontFamily: "'Outfit', sans-serif" }}>${fundedTotal.toLocaleString()}</div>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}>
                          <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#4a6278' }}>Remaining</div>
                          <div className="text-lg font-black mt-1" style={{ color: '#fbbf24', fontFamily: "'Outfit', sans-serif" }}>${remainingSponsorBudget.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="rounded-xl p-4" style={{ background: 'rgba(196,181,253,0.08)', border: '1px solid rgba(196,181,253,0.16)' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#c4b5fd' }}>Sponsor Portfolio</p>
                        <p className="text-sm font-black leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>Track campaign funding, delivery, and sponsor-facing impact.</p>
                      </div>

                      <Link
                        href="/dashboard?view=impact-roi"
                        className="flex items-center justify-between rounded-xl p-4 text-left transition-all hover:opacity-90"
                        style={{ background: 'rgba(34,197,94,0.09)', border: '1px solid rgba(34,197,94,0.18)', color: '#e6edf3' }}
                      >
                        <span>
                          <span className="block text-xs font-black" style={{ color: '#34d399' }}>View ROI report</span>
                          <span className="mt-1 block text-[11px] leading-relaxed" style={{ color: '#7d8fa1' }}>See the business case behind verified impact.</span>
                        </span>
                        <BarChart2 size={16} style={{ color: '#34d399' }} />
                      </Link>

                      {sponsorRows.map(({ campaign, sponsor, progress }) => (
                        <div
                          key={campaign.id}
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="text-xs font-black" style={{ color: '#e6edf3' }}>{campaign.title}</div>
                              <div className="text-[10px] mt-0.5" style={{ color: '#7d8fa1' }}>{sponsor?.name ?? 'Unassigned sponsor'}</div>
                            </div>
                            <span className="text-[10px] font-black" style={{ color: progress >= 50 ? '#34d399' : '#fbbf24' }}>{progress}%</span>
                          </div>
                          <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: progress >= 50 ? '#34d399' : '#fbbf24' }} />
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                            <div>
                              <div style={{ color: '#4a6278' }}>Goals</div>
                              <div className="font-black" style={{ color: '#c9d1d9' }}>{campaign.completedGoal}/{campaign.targetGoal}</div>
                            </div>
                            <div>
                              <div style={{ color: '#4a6278' }}>Budget</div>
                              <div className="font-black" style={{ color: '#c9d1d9' }}>${campaign.totalBudget}</div>
                            </div>
                            <div>
                              <div style={{ color: '#4a6278' }}>Left</div>
                              <div className="font-black" style={{ color: '#c9d1d9' }}>${campaign.remainingBudget}</div>
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

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#4a6278' }}>{label}</div>
      <div className="mt-1 text-sm font-black" style={{ color: '#e6edf3', fontFamily: "'Outfit', sans-serif" }}>{value}</div>
    </div>
  );
}

function MetricCard({
  color,
  icon: Icon,
  label,
  value,
}: {
  color: string;
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#4a6278' }}>{label}</p>
        <Icon size={17} style={{ color }} />
      </div>
      <div className="mt-4 text-3xl font-black" style={{ color, fontFamily: "'Outfit', sans-serif" }}>{value}</div>
    </div>
  );
}

function LeaderboardColumn({
  rows,
  title,
}: {
  rows: Array<{ name: string; meta: string; value: string }>;
  title: string;
}) {
  return (
    <section className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h2 className="text-lg font-black" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
      <div className="mt-4 grid gap-3">
        {rows.map((row, index) => (
          <div key={`${row.name}-${index}`} className="flex items-center gap-3 rounded-xl p-3" style={{ background: index === 0 ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ background: index === 0 ? '#fbbf24' : 'rgba(255,255,255,0.08)', color: index === 0 ? '#0c1118' : '#7d8fa1' }}>
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black">{row.name}</span>
              <span className="mt-1 block truncate text-[10px]" style={{ color: '#7d8fa1' }}>{row.meta}</span>
            </span>
            <span className="text-sm font-black" style={{ color: '#34d399' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
