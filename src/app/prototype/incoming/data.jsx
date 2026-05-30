/* eslint-disable */
import * as React from 'react';
// app/data.jsx - shared mock data for the CivicTree prototype
// All data is mocked for this conceptual demo.

// ─── Neighborhood game board ────────────────────────────────────────────────
const NEIGHBORHOODS = [
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

const STATE_CONFIG = {
  'needs-care':      { label: 'Needs Care',     accent: '#f87171', bg: 'rgba(239,68,68,0.13)',   border: 'rgba(239,68,68,0.35)',   text: '#fca5a5', glow: 'rgba(239,68,68,0.25)' },
  'active':          { label: 'Active',          accent: '#fbbf24', bg: 'rgba(251,191,36,0.11)',  border: 'rgba(251,191,36,0.32)',  text: '#fde68a', glow: 'rgba(251,191,36,0.2)'  },
  'improving':       { label: 'Improving',       accent: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.32)',  text: '#6ee7b7', glow: 'rgba(52,211,153,0.2)'  },
  'thriving':        { label: 'Thriving',        accent: '#10b981', bg: 'rgba(16,185,129,0.16)',  border: 'rgba(16,185,129,0.4)',   text: '#34d399', glow: 'rgba(16,185,129,0.25)' },
  'fully-stewarded': { label: 'Fully Stewarded', accent: '#a7f3d0', bg: 'rgba(167,243,208,0.14)', border: 'rgba(167,243,208,0.45)', text: '#a7f3d0', glow: 'rgba(167,243,208,0.3)' },
};

// ─── Leaderboards ───────────────────────────────────────────────────────────
const LEADERBOARD_WORKERS = [
  { rank: 1, name: 'Maria R.', neighborhood: 'Venice', tasks: 47, earned: 1240, quality: 99 },
  { rank: 2, name: 'Carlos T.', neighborhood: 'Downtown', tasks: 43, earned: 1130, quality: 98 },
  { rank: 3, name: 'Austin V.', neighborhood: 'Historic Core', tasks: 38, earned: 1040, quality: 98 },
  { rank: 4, name: 'Priya K.', neighborhood: 'Koreatown', tasks: 35, earned: 920, quality: 97 },
  { rank: 5, name: 'James M.', neighborhood: 'Culver City', tasks: 31, earned: 810, quality: 96 },
  { rank: 6, name: 'Dana W.', neighborhood: 'Hollywood', tasks: 28, earned: 740, quality: 96 },
  { rank: 7, name: 'Leo S.', neighborhood: 'Arts District', tasks: 25, earned: 660, quality: 95 },
];

const LEADERBOARD_CREWS = [
  { rank: 1, name: 'Ocean Ave Stewards', neighborhood: 'Santa Monica', members: 12, tasks: 445 },
  { rank: 2, name: 'Boardwalk Brigade', neighborhood: 'Venice', members: 9, tasks: 312 },
  { rank: 3, name: 'Spring Street Stewards', neighborhood: 'Downtown', members: 8, tasks: 201 },
  { rank: 4, name: 'Culver Civic League', neighborhood: 'Culver City', members: 7, tasks: 168 },
  { rank: 5, name: 'Hillside Crew', neighborhood: 'Los Feliz', members: 5, tasks: 127 },
];

const LEADERBOARD_NEIGHBORHOODS = [...NEIGHBORHOODS]
  .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
  .slice(0, 6)
  .map((n, i) => ({ rank: i + 1, name: n.name, level: n.level, tasks: n.tasksCompleted, paid: n.dollarsPaid, state: n.state }));

const MOST_IMPROVED = [
  { rank: 1, name: 'Koreatown', delta: '+18%', detail: 'Level 2 - 7 days', state: 'active' },
  { rank: 2, name: 'Boyle Heights', delta: '+15%', detail: 'Level 2 - 7 days', state: 'active' },
  { rank: 3, name: 'Downtown', delta: '+12%', detail: 'Level 3 - 7 days', state: 'improving' },
  { rank: 4, name: 'Culver City', delta: '+9%', detail: 'Level 3 - 7 days', state: 'thriving' },
  { rank: 5, name: 'Los Feliz', delta: '+7%', detail: 'Level 3 - 7 days', state: 'improving' },
];

// ─── Campaigns ──────────────────────────────────────────────────────────────
const ACTIVE_CAMPAIGNS = [
  { name: 'Broadway Block Reset', neighborhood: 'Downtown', progress: 42, tasksLeft: 58, tasksDone: 42, budget: '$3,160', sponsor: 'City of LA', funded: true, raised: 3160, goal: 7500 },
  { name: 'Hollywood Care Drive', neighborhood: 'Hollywood', progress: 40, tasksLeft: 60, tasksDone: 40, budget: '$2,400', sponsor: 'Hollywood BID', funded: true, raised: 2400, goal: 6000 },
  { name: 'Heritage Corridor', neighborhood: 'Chinatown', progress: 58, tasksLeft: 42, tasksDone: 58, budget: '$1,680', sponsor: null, funded: false, raised: 1680, goal: 4000 },
  { name: 'Culver Green', neighborhood: 'Culver City', progress: 75, tasksLeft: 25, tasksDone: 75, budget: '$1,250', sponsor: 'Culver City', funded: true, raised: 3750, goal: 5000 },
  { name: 'South LA Restore', neighborhood: 'South LA', progress: 5, tasksLeft: 95, tasksDone: 5, budget: 'Needs funding', sponsor: null, funded: false, raised: 250, goal: 8000 },
];

// ─── Activity feed ──────────────────────────────────────────────────────────
const ACTIVITY_FEED = [
  { time: '2m ago',  text: 'Litter cleared on Broadway & 7th',           neighborhood: 'Downtown',    amount: 18 },
  { time: '8m ago',  text: 'Planter maintained near Echo Park Lake',      neighborhood: 'Silver Lake', amount: 24 },
  { time: '14m ago', text: 'Graffiti reported on Santa Monica Blvd',      neighborhood: 'Hollywood',   amount: null },
  { time: '19m ago', text: 'Sidewalk cleared on Main St',                 neighborhood: 'Venice',      amount: 45 },
  { time: '31m ago', text: 'Report verified on 7th & Main',               neighborhood: 'Downtown',    amount: 3 },
  { time: '45m ago', text: 'Trash cleared near Culver City Arts Center',  neighborhood: 'Culver City', amount: 22 },
  { time: '1h ago',  text: 'New crew formed: Soto Street Crew',           neighborhood: 'Boyle Hts',   amount: null },
  { time: '1h ago',  text: '$810 paid out to James M.',                   neighborhood: 'Culver City', amount: null },
];

// ─── Submissions awaiting review (admin) ────────────────────────────────────
const REVIEW_QUEUE = [
  { id: 'sub-1', worker: 'Austin V.', task: 'Clear litter on Oak St', neighborhood: 'Downtown', payout: 18, minutes: 22, submitted: '6m ago', quality: 98, notes: 'Cleared two full bags from the planter strip and curb.' },
  { id: 'sub-2', worker: 'Priya K.', task: 'Water planters - Spring St route', neighborhood: 'Downtown', payout: 24, minutes: 35, submitted: '20m ago', quality: 97, notes: 'All 9 planters watered. Two looked stressed, flagged for review.' },
  { id: 'sub-3', worker: 'Leo S.', task: 'Remove stickers from signal box', neighborhood: 'Arts District', payout: 12, minutes: 15, submitted: '41m ago', quality: 95, notes: 'Removed ~30 stickers, residue gone. No tools needed.' },
  { id: 'sub-4', worker: 'Dana W.', task: 'Sidewalk sweep - Vine St', neighborhood: 'Hollywood', payout: 20, minutes: 28, submitted: '1h ago', quality: 96, notes: 'Full block swept end to end. Before/after attached.' },
];

// ─── Worker (mobile) tasks ──────────────────────────────────────────────────
const WORKER_TASKS = [
  { id: 'task-litter-oak', title: 'Clear loose litter on Oak St', type: 'cleanup', payout: 18, minutes: 20, distance: '0.2 mi', tools: 'None - gloves provided at depot', difficulty: 'Beginner-safe', x: 45, y: 42, safety: 'Wear the gloves from your kit. Do not pick up sharps - report them instead.', desc: 'Loose trash has collected along the planter strip and curb on the 700 block of Oak St.' },
  { id: 'task-planter-broadway', title: 'Water planters - Broadway route', type: 'green', payout: 24, minutes: 35, distance: '0.4 mi', tools: 'Watering can at Spring St Depot', difficulty: 'Beginner-safe', x: 60, y: 30, safety: 'Stay on the sidewalk. Watch for foot traffic during busy hours.', desc: 'Nine street planters along Broadway need watering. Route starts at 5th & Broadway.' },
  { id: 'task-sticker-signal', title: 'Remove stickers from signal box', type: 'cleanup', payout: 12, minutes: 15, distance: '0.3 mi', tools: 'Scraper at depot', difficulty: 'Beginner-safe', x: 30, y: 60, safety: 'Do not step into the street. Work only from the sidewalk side of the box.', desc: 'Signal box at 6th & Main is covered in stickers. Scrape clean, no chemicals needed.' },
  { id: 'task-verify-main', title: 'Verify a report near 7th & Main', type: 'verify', payout: 3, minutes: 8, distance: '0.1 mi', tools: 'None', difficulty: 'Quick check', x: 52, y: 70, safety: 'Just confirm what you see. Keep a safe distance from any hazard.', desc: 'Someone reported a broken trash can. Confirm whether it still needs work and add a photo.' },
];

const LEVEL_NAMES = ['Seed', 'Sprout', 'Branch', 'Grove', 'Steward', 'City Steward'];

// Worker profile (mobile field app - "Austin")
const WORKER = {
  name: 'Austin',
  neighborhood: 'Downtown / Historic Core',
  level: 3,
  levelLabel: 'Branch',
  progressToNext: 64,
  available: 124.0,
  pending: 42.0,
  lifetimeEarned: 1040,
  tasksDone: 38,
  quality: 98,
  blocksImproved: 8,
  streakDays: 5,
};

Object.assign(window, {
  NEIGHBORHOODS, STATE_CONFIG,
  LEADERBOARD_WORKERS, LEADERBOARD_CREWS, LEADERBOARD_NEIGHBORHOODS, MOST_IMPROVED,
  ACTIVE_CAMPAIGNS, ACTIVITY_FEED, REVIEW_QUEUE, WORKER_TASKS, LEVEL_NAMES, WORKER,
});
