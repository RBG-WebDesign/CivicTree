import type {
  DemoState,
  Worker,
  Admin,
  Sponsor,
  Neighborhood,
  Campaign,
  Task,
  Claim,
  Submission,
  Payment,
  Report,
} from './types';
import {
  ALLEY_AFTER_IMAGE,
  ALLEY_BEFORE_IMAGE,
  PLACEHOLDER_TASK_IMAGE,
  DEMO_EPOCH,
} from './constants';

/** Returns a fresh, fully independent DemoState on every call. */
export function createSeedState(): DemoState {
  // ISO strings derived from DEMO_EPOCH so no runtime non-determinism
  const t0 = new Date(DEMO_EPOCH).toISOString();           // 2026-05-29T09:00:00.000Z
  const t1 = new Date(DEMO_EPOCH + 60_000).toISOString();  // +1 min
  const t2 = new Date(DEMO_EPOCH + 120_000).toISOString(); // +2 min
  const t3 = new Date(DEMO_EPOCH + 180_000).toISOString(); // +3 min
  const t4 = new Date(DEMO_EPOCH + 240_000).toISOString(); // +4 min
  const t5 = new Date(DEMO_EPOCH + 300_000).toISOString(); // +5 min

  // ── Neighborhoods ──────────────────────────────────────────────────────────
  const neighborhoods: Neighborhood[] = [
    {
      id: 'downtown',
      name: 'Downtown',
      state: 'Improving',
      level: 3,
      tasksCompleted: 128,
      paidTotal: 4200,
      blocksImproved: 18,
      openReports: 5,
    },
    {
      id: 'south-la',
      name: 'South LA',
      state: 'Needs Care',
      level: 1,
      tasksCompleted: 34,
      paidTotal: 820,
      blocksImproved: 4,
      openReports: 12,
    },
    {
      id: 'koreatown',
      name: 'Koreatown',
      state: 'Active',
      level: 2,
      tasksCompleted: 76,
      paidTotal: 2100,
      blocksImproved: 9,
      openReports: 7,
    },
    {
      id: 'venice',
      name: 'Venice',
      state: 'Thriving',
      level: 4,
      tasksCompleted: 210,
      paidTotal: 6800,
      blocksImproved: 27,
      openReports: 2,
    },
    {
      id: 'santa-monica',
      name: 'Santa Monica',
      state: 'Fully Stewarded',
      level: 4,
      tasksCompleted: 305,
      paidTotal: 9500,
      blocksImproved: 41,
      openReports: 1,
    },
  ];

  // ── Sponsors ───────────────────────────────────────────────────────────────
  const sponsors: Sponsor[] = [
    {
      id: 'sponsor-dtla',
      name: 'DTLA Cleanup Fund',
      role: 'sponsor',
      campaignIds: ['campaign-broadway'],
    },
  ];

  // ── Campaigns ──────────────────────────────────────────────────────────────
  const campaigns: Campaign[] = [
    {
      id: 'campaign-broadway',
      title: 'Broadway Block Reset',
      description:
        'Help clean and care for the Broadway corridor. Complete 100 tasks by Sunday.',
      sponsorId: 'sponsor-dtla',
      targetGoal: 100,
      completedGoal: 42,
      totalBudget: 5000,
      remainingBudget: 3160,
    },
  ];

  // ── Workers ────────────────────────────────────────────────────────────────
  const workers: Worker[] = [
    {
      id: 'worker-austin-id',
      name: 'Austin',
      role: 'worker',
      onboardingCompleted: true,
      neighborhoodId: 'downtown',
      level: 2,
      reliabilityScore: 98.5,
      safetyScore: 100,
      unlockedTaskTypes: ['beginner', 'planter', 'verify'],
    },
    {
      id: 'worker-new-id',
      name: 'Maya',
      role: 'worker',
      onboardingCompleted: false,
      neighborhoodId: 'downtown',
      level: 1,
      reliabilityScore: 100,
      safetyScore: 100,
      unlockedTaskTypes: ['beginner'],
    },
    {
      id: 'worker-notasks-id',
      name: 'Jordan',
      role: 'worker',
      onboardingCompleted: true,
      neighborhoodId: 'venice',
      level: 1,
      reliabilityScore: 100,
      safetyScore: 100,
      unlockedTaskTypes: ['beginner'],
    },
  ];

  // ── Admins ─────────────────────────────────────────────────────────────────
  const admins: Admin[] = [{ id: 'admin-id', name: 'Admin User', role: 'admin' }];

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const tasks: Task[] = [
    // ── Open tasks (ported from prisma/seed.js) ──
    {
      id: 'task-litter-oak',
      title: 'Clean litter on Oak St',
      description:
        'Clean loose trash along sidewalk and near curb. Fill up to 2 bags. Place bags at the marked pickup spot.',
      status: 'open',
      payoutAmount: 28,
      estimatedMinutes: 25,
      requiredTools: ['gloves', 'trash bag'],
      safetyNotes: "Don't touch needles. Report them. Watch for vehicle traffic.",
      doList: [
        'Pick up loose trash',
        'Fill up to 2 bags',
        'Place bags at marked pickup spot',
        'Take photos',
      ],
      dontList: [
        'Do not touch needles',
        'Do not touch human waste',
        'Do not move personal belongings',
        'Do not enter private property',
        'Do not work in traffic',
      ],
      location: { lat: 34.045, lng: -118.251 },
      taskType: 'cleanup',
      neighborhoodId: 'downtown',
      campaignId: 'campaign-broadway',
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-water-broadway',
      title: 'Water planters on Broadway',
      description:
        'Water all 6 sidewalk planter boxes along the block. Fetch water key from Depot.',
      status: 'open',
      payoutAmount: 32,
      estimatedMinutes: 35,
      requiredTools: ['gloves', 'watering can', 'water key'],
      safetyNotes:
        'Be mindful of pedestrians. Do not spill water on storefront entrances.',
      doList: ['Fill watering can', 'Water all 6 planters', 'Take before and after photos'],
      dontList: [
        'Do not block sidewalks',
        'Do not work in traffic lanes',
        'Do not touch building windows',
      ],
      location: { lat: 34.0441, lng: -118.2515 },
      taskType: 'planter',
      neighborhoodId: 'downtown',
      campaignId: 'campaign-broadway',
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-sign-hazards',
      title: 'Report damaged signs',
      description:
        'Walk the designated corridor block and photograph any damaged, defaced, or missing street signage.',
      status: 'open',
      payoutAmount: 12,
      estimatedMinutes: 10,
      requiredTools: ['none'],
      safetyNotes: 'Work from sidewalk only. Avoid stepping onto the street.',
      doList: [
        'Find damaged signs',
        'Take clear photos showing the damage and location',
        'Submit report in app',
      ],
      dontList: ['Do not touch signs or poles', 'Do not step off curb', 'Do not enter street'],
      location: { lat: 34.0435, lng: -118.2498 },
      taskType: 'report',
      neighborhoodId: 'downtown',
      campaignId: null,
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-verify-planter',
      title: 'Check if Broadway planter needs water',
      description:
        'Walk by the Broadway corridor planter at 7th and check if soil is dry. Take a photo.',
      status: 'open',
      payoutAmount: 10,
      estimatedMinutes: 5,
      requiredTools: ['none'],
      safetyNotes: 'Stay on sidewalk.',
      doList: ['Walk to planter', 'Photograph soil condition', 'Submit'],
      dontList: ['Do not enter street', 'Do not touch private property'],
      location: { lat: 34.0438, lng: -118.2505 },
      taskType: 'verify',
      neighborhoodId: 'downtown',
      campaignId: null,
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-verify-trash-cleared',
      title: 'Verify alley trash is cleared',
      description:
        'Walk down Harlem Place alley and check if the bulky trash pile has been removed. Take one photo.',
      status: 'open',
      payoutAmount: 12,
      estimatedMinutes: 5,
      requiredTools: ['none'],
      safetyNotes:
        'Maintain situational awareness in alleyways. Do not touch trash.',
      doList: [
        'Walk to Harlem Place coordinates',
        'Take photo of the spot',
        'Submit status report',
      ],
      dontList: [
        'Do not touch trash',
        'Do not block vehicle access',
        'Do not confront anyone',
      ],
      location: { lat: 34.0456, lng: -118.2505 },
      taskType: 'verify',
      neighborhoodId: 'downtown',
      campaignId: null,
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-paint-curb-numbers',
      title: 'Paint curb numbers on Spring St',
      description:
        'Refresh faded curb address numbers for four storefronts using the provided stencil kit.',
      status: 'open',
      payoutAmount: 65,
      estimatedMinutes: 75,
      requiredTools: ['stencil kit', 'paint', 'gloves'],
      safetyNotes: 'Stay on the sidewalk side of the curb. Pause when traffic is close.',
      doList: [
        'Tape stencil cleanly',
        'Paint four curb numbers',
        'Let paint dry before removing stencil',
        'Take before and after photos',
      ],
      dontList: [
        'Do not step into traffic',
        'Do not paint private walls',
        'Do not work without cones',
      ],
      location: { lat: 34.0447, lng: -118.2496 },
      taskType: 'painting',
      neighborhoodId: 'downtown',
      campaignId: 'campaign-broadway',
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-needs-funding',
      title: 'Clean planter area on Main St',
      description:
        'Remove weeds, debris and trash from the overgrown street planter on Main St.',
      status: 'open',
      payoutAmount: 38,
      estimatedMinutes: 30,
      requiredTools: ['gloves', 'weeding tool', 'trash bag'],
      safetyNotes: 'Wear heavy-duty gloves. Watch for sharp objects.',
      doList: ['Remove weeds', 'Pick up trash inside planter', 'Place debris at pickup spot'],
      dontList: [
        'Do not touch needles',
        'Do not damage planter structure',
        'Do not enter street',
      ],
      location: { lat: 34.046, lng: -118.2485 },
      taskType: 'planter',
      neighborhoodId: 'downtown',
      campaignId: null,
      isFundingNeeded: true,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-coming-soon',
      title: 'Team cleanup this Saturday',
      description:
        'Join a 6-person crew to clear major litter along the transit corridor. Tools and snacks provided.',
      status: 'open',
      payoutAmount: 180,
      estimatedMinutes: 90,
      requiredTools: ['gloves', 'vest (provided at depot)'],
      safetyNotes: 'Follow Steward instructions. Work together, stay in group.',
      doList: ['Meet at Depot at 10 AM', 'Clean assigned zone with team', 'Return tools'],
      dontList: [
        'Do not separate from team',
        'Do not touch hazardous materials',
        'Do not work without vest',
      ],
      location: { lat: 34.0445, lng: -118.252 },
      taskType: 'cleanup',
      neighborhoodId: 'downtown',
      campaignId: null,
      isFundingNeeded: false,
      isComingSoon: true,
      reportedByUserId: null,
    },

    // ── Austin's historical tasks ──
    {
      id: 'task-hist-pending',
      title: 'Clean sidewalk litter on Spring St',
      description: 'Clean loose trash on sidewalk.',
      status: 'submitted',
      payoutAmount: 28,
      estimatedMinutes: 20,
      requiredTools: ['gloves', 'bags'],
      safetyNotes: 'Watch for pedestrians.',
      doList: ['Clean sidewalk', 'Bag trash', 'Take photos'],
      dontList: ['Do not work in street'],
      location: { lat: 34.043, lng: -118.249 },
      taskType: 'cleanup',
      neighborhoodId: 'downtown',
      campaignId: null,
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-hist-approved',
      title: 'Water planters on 7th St',
      description: 'Water planters.',
      status: 'approved',
      payoutAmount: 32,
      estimatedMinutes: 25,
      requiredTools: ['watering can'],
      safetyNotes: 'Stay safe.',
      doList: ['Water', 'Photos'],
      dontList: ['Traffic'],
      location: { lat: 34.044, lng: -118.248 },
      taskType: 'planter',
      neighborhoodId: 'downtown',
      campaignId: null,
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
    {
      id: 'task-hist-paid',
      title: 'Remove stickers at 6th & Spring',
      description: 'Remove stickers.',
      status: 'approved',
      payoutAmount: 20,
      estimatedMinutes: 15,
      requiredTools: ['scraper'],
      safetyNotes: 'Wear gloves.',
      doList: ['Scrape', 'Clean', 'Photos'],
      dontList: ['Private property'],
      location: { lat: 34.0442, lng: -118.2492 },
      taskType: 'cleanup',
      neighborhoodId: 'downtown',
      campaignId: null,
      isFundingNeeded: false,
      isComingSoon: false,
      reportedByUserId: null,
    },
  ];

  // ── Claims ─────────────────────────────────────────────────────────────────
  const claims: Claim[] = [
    {
      id: 'claim-hist-pending',
      taskId: 'task-hist-pending',
      workerId: 'worker-austin-id',
      status: 'submitted',
      claimedAt: t0,
      startedAt: t1,
      completedAt: t2,
      gpsCheckin: null,
    },
    {
      id: 'claim-hist-approved',
      taskId: 'task-hist-approved',
      workerId: 'worker-austin-id',
      status: 'completed',
      claimedAt: t1,
      startedAt: t2,
      completedAt: t3,
      gpsCheckin: null,
    },
    {
      id: 'claim-hist-paid',
      taskId: 'task-hist-paid',
      workerId: 'worker-austin-id',
      status: 'completed',
      claimedAt: t2,
      startedAt: t3,
      completedAt: t4,
      gpsCheckin: null,
    },
  ];

  // ── Submissions ────────────────────────────────────────────────────────────
  const submissions: Submission[] = [
    {
      id: 'sub-hist-pending',
      taskId: 'task-hist-pending',
      workerId: 'worker-austin-id',
      claimId: 'claim-hist-pending',
      beforePhoto: ALLEY_BEFORE_IMAGE,
      afterPhoto: ALLEY_AFTER_IMAGE,
      notes: 'Alley is now clear. Removed loose litter and staged two bags for pickup.',
      status: 'submitted',
      submittedAt: t2,
      reviewReason: null,
    },
    {
      id: 'sub-hist-approved',
      taskId: 'task-hist-approved',
      workerId: 'worker-austin-id',
      claimId: 'claim-hist-approved',
      beforePhoto: ALLEY_BEFORE_IMAGE,
      afterPhoto: ALLEY_AFTER_IMAGE,
      notes: 'Watered all 4 planters.',
      status: 'approved',
      submittedAt: t3,
      reviewReason: null,
    },
    {
      id: 'sub-hist-paid',
      taskId: 'task-hist-paid',
      workerId: 'worker-austin-id',
      claimId: 'claim-hist-paid',
      beforePhoto: ALLEY_BEFORE_IMAGE,
      afterPhoto: ALLEY_AFTER_IMAGE,
      notes: 'Stickers removed from light post.',
      status: 'approved',
      submittedAt: t4,
      reviewReason: null,
    },
  ];

  // ── Payments ───────────────────────────────────────────────────────────────
  const payments: Payment[] = [
    {
      id: 'pay-hist-pending',
      workerId: 'worker-austin-id',
      submissionId: 'sub-hist-pending',
      amount: 28,
      status: 'pending_review',
      createdAt: t2,
    },
    {
      id: 'pay-hist-approved',
      workerId: 'worker-austin-id',
      submissionId: 'sub-hist-approved',
      amount: 32,
      status: 'available',
      createdAt: t3,
    },
    {
      id: 'pay-hist-paid',
      workerId: 'worker-austin-id',
      submissionId: 'sub-hist-paid',
      amount: 20,
      status: 'paid',
      createdAt: t4,
    },
  ];

  // ── Reports ────────────────────────────────────────────────────────────────
  const reports: Report[] = [
    {
      id: 'report-trash-broadway',
      userId: 'worker-austin-id',
      photoUrl: PLACEHOLDER_TASK_IMAGE,
      location: { lat: 34.0448, lng: -118.2512 },
      category: 'trash',
      note: 'Bulky trash pile dumped near alley entrance.',
      status: 'pending',
      createdAt: t5,
    },
    {
      id: 'report-graffiti-spring',
      userId: 'worker-austin-id',
      photoUrl: PLACEHOLDER_TASK_IMAGE,
      location: { lat: 34.0439, lng: -118.2495 },
      category: 'graffiti',
      note: 'Graffiti tagging on electrical box.',
      status: 'city_routed',
      createdAt: t5,
    },
  ];

  return {
    workers,
    admins,
    sponsors,
    neighborhoods,
    campaigns,
    tasks,
    claims,
    submissions,
    payments,
    reports,
    activePersona: { role: 'worker', userId: 'worker-austin-id' },
  };
}
