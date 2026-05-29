// prisma/seed.js
const { PrismaClient } = require('../src/generated/prisma');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');
  
  // Clear out db in order of dependency
  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Campaigns
  const campaignBroadway = await prisma.campaign.create({
    data: {
      id: 'campaign-broadway',
      title: 'Broadway Block Reset',
      description: 'Help clean and care for the Broadway corridor. Complete 100 tasks by Sunday.',
      targetGoal: 100,
      completedGoal: 42,
      totalBudget: 5000.0,
      remainingBudget: 3160.0,
    },
  });

  // 2. Create Users
  // Experienced Worker (Austin)
  const workerAustin = await prisma.user.create({
    data: {
      id: 'worker-austin-id',
      name: 'Austin',
      role: 'worker',
      onboardingCompleted: true,
      neighborhood: 'Historic Core',
      language: 'en',
      phone: '213-555-0199',
      level: 2,
      reliabilityScore: 98.5,
      safetyScore: 100.0,
      unlockedTaskTypes: 'beginner,planter,verify',
    },
  });

  // New Worker (needs onboarding)
  const workerNew = await prisma.user.create({
    data: {
      id: 'worker-new-id',
      name: 'Maya',
      role: 'worker',
      onboardingCompleted: false,
      neighborhood: 'Downtown LA',
      language: 'en',
      phone: '213-555-0122',
      level: 1,
      reliabilityScore: 100.0,
      safetyScore: 100.0,
      unlockedTaskTypes: 'beginner',
    },
  });

  // Trained but empty-map worker (simulated context)
  const workerNoTasks = await prisma.user.create({
    data: {
      id: 'worker-notasks-id',
      name: 'Jordan',
      role: 'worker',
      onboardingCompleted: true,
      neighborhood: 'Arts District',
      language: 'en',
      phone: '213-555-0133',
      level: 1,
      reliabilityScore: 100.0,
      safetyScore: 100.0,
      unlockedTaskTypes: 'beginner',
    },
  });

  // Admin User
  const admin = await prisma.user.create({
    data: {
      id: 'admin-id',
      name: 'Admin User',
      role: 'admin',
      onboardingCompleted: true,
    },
  });

  // 3. Create Tasks
  // Active/Open Cleanups
  await prisma.task.create({
    data: {
      id: 'task-litter-oak',
      title: 'Clean litter on Oak St',
      description: 'Clean loose trash along sidewalk and near curb. Fill up to 2 bags. Place bags at the marked pickup spot.',
      payoutAmount: 18.0,
      estimatedMinutes: 25,
      requiredTools: 'gloves, trash bag',
      safetyNotes: 'Don’t touch needles. Report them. Watch for vehicle traffic.',
      doList: 'Pick up loose trash, Fill up to 2 bags, Place bags at marked pickup spot, Take photos',
      dontList: 'Do not touch needles, Do not touch human waste, Do not move personal belongings, Do not enter private property, Do not work in traffic',
      latitude: 34.0450,
      longitude: -118.2510,
      taskType: 'cleanup',
      campaignId: 'campaign-broadway',
      status: 'open',
    },
  });

  await prisma.task.create({
    data: {
      id: 'task-water-broadway',
      title: 'Water planters on Broadway',
      description: 'Water all 6 sidewalk planter boxes along the block. Fetch water key from Depot.',
      payoutAmount: 22.0,
      estimatedMinutes: 35,
      requiredTools: 'gloves, watering can, water key',
      safetyNotes: 'Be mindful of pedestrians. Do not spill water on storefront entrances.',
      doList: 'Fill watering can, Water all 6 planters, Take before and after photos',
      dontList: 'Do not block sidewalks, Do not work in traffic lanes, Do not touch building windows',
      latitude: 34.0441,
      longitude: -118.2515,
      taskType: 'planter',
      campaignId: 'campaign-broadway',
      status: 'open',
    },
  });

  await prisma.task.create({
    data: {
      id: 'task-sign-hazards',
      title: 'Report damaged signs',
      description: 'Walk the designated corridor block and photograph any damaged, defaced, or missing street signage.',
      payoutAmount: 6.0,
      estimatedMinutes: 10,
      requiredTools: 'none',
      safetyNotes: 'Work from sidewalk only. Avoid stepping onto the street.',
      doList: 'Find damaged signs, Take clear photos showing the damage and location, Submit report in app',
      dontList: 'Do not touch signs or poles, Do not step off curb, Do not enter street',
      latitude: 34.0435,
      longitude: -118.2498,
      taskType: 'report',
      status: 'open',
    },
  });

  // Micro-task: Verify Report
  await prisma.task.create({
    data: {
      id: 'task-verify-planter',
      title: 'Check if Broadway planter needs water',
      description: 'Walk by the Broadway corridor planter at 7th and check if soil is dry. Take a photo.',
      payoutAmount: 2.0,
      estimatedMinutes: 5,
      requiredTools: 'none',
      safetyNotes: 'Stay on sidewalk.',
      doList: 'Walk to planter, Photograph soil condition, Submit',
      dontList: 'Do not enter street, Do not touch private property',
      latitude: 34.0438,
      longitude: -118.2505,
      taskType: 'verify',
      status: 'open',
    },
  });

  await prisma.task.create({
    data: {
      id: 'task-verify-trash-cleared',
      title: 'Verify alley trash is cleared',
      description: 'Walk down Harlem Place alley and check if the bulky trash pile has been removed. Take one photo.',
      payoutAmount: 3.0,
      estimatedMinutes: 5,
      requiredTools: 'none',
      safetyNotes: 'Maintain situational awareness in alleyways. Do not touch trash.',
      doList: 'Walk to Harlem Place coordinates, Take photo of the spot, Submit status report',
      dontList: 'Do not touch trash, Do not block vehicle access, Do not confront anyone',
      latitude: 34.0456,
      longitude: -118.2505,
      taskType: 'verify',
      status: 'open',
    },
  });

  // Needs Funding Task
  await prisma.task.create({
    data: {
      id: 'task-needs-funding',
      title: 'Clean planter area on Main St',
      description: 'Remove weeds, debris and trash from the overgrown street planter on Main St.',
      payoutAmount: 22.0,
      estimatedMinutes: 30,
      requiredTools: 'gloves, weeding tool, trash bag',
      safetyNotes: 'Wear heavy-duty gloves. Watch for sharp objects.',
      doList: 'Remove weeds, Pick up trash inside planter, Place debris at pickup spot',
      dontList: 'Do not touch needles, Do not damage planter structure, Do not enter street',
      latitude: 34.0460,
      longitude: -118.2485,
      taskType: 'planter',
      isFundingNeeded: true,
      status: 'open',
    },
  });

  // Coming Soon Task
  await prisma.task.create({
    data: {
      id: 'task-coming-soon',
      title: 'Team cleanup this Saturday',
      description: 'Join a 6-person crew to clear major litter along the transit corridor. Tools and snacks provided.',
      payoutAmount: 50.0,
      estimatedMinutes: 90,
      requiredTools: 'gloves, vest (provided at depot)',
      safetyNotes: 'Follow Steward instructions. Work together, stay in group.',
      doList: 'Meet at Depot at 10 AM, Clean assigned zone with team, Return tools',
      dontList: 'Do not separate from team, Do not touch hazardous materials, Do not work without vest',
      latitude: 34.0445,
      longitude: -118.2520,
      taskType: 'cleanup',
      isComingSoon: true,
      status: 'open',
    },
  });

  // 4. Create Historical Tasks and Submissions/Reviews/Payments for Austin to establish balances
  // Completed & Pending Review Task
  const taskPending = await prisma.task.create({
    data: {
      id: 'task-hist-pending',
      title: 'Clean sidewalk litter on Spring St',
      description: 'Clean loose trash on sidewalk.',
      payoutAmount: 18.0,
      estimatedMinutes: 20,
      requiredTools: 'gloves, bags',
      safetyNotes: 'Watch for pedestrians.',
      doList: 'Clean sidewalk, Bag trash, Take photos',
      dontList: 'Do not work in street',
      latitude: 34.0430,
      longitude: -118.2490,
      taskType: 'cleanup',
      status: 'submitted',
    },
  });

  const claimPending = await prisma.claim.create({
    data: {
      id: 'claim-hist-pending',
      taskId: 'task-hist-pending',
      workerId: 'worker-austin-id',
      status: 'submitted',
      gpsCheckin: '{"lat":34.0430,"lng":-118.2490}',
    },
  });

  const submissionPending = await prisma.submission.create({
    data: {
      id: 'sub-hist-pending',
      taskId: 'task-hist-pending',
      workerId: 'worker-austin-id',
      claimId: 'claim-hist-pending',
      beforePhotos: '/task_thumbnail.png',
      afterPhotos: '/volunteers_working.png',
      notes: 'Sidewalk is now completely clean. Filled one bag.',
      status: 'submitted',
    },
  });

  await prisma.payment.create({
    data: {
      id: 'pay-hist-pending',
      workerId: 'worker-austin-id',
      submissionId: 'sub-hist-pending',
      amount: 18.0,
      status: 'pending_review',
    },
  });

  // Completed & Approved (Available) Task
  const taskApproved = await prisma.task.create({
    data: {
      id: 'task-hist-approved',
      title: 'Water planters on 7th St',
      description: 'Water planters.',
      payoutAmount: 24.0,
      estimatedMinutes: 25,
      requiredTools: 'watering can',
      safetyNotes: 'Stay safe.',
      doList: 'Water, Photos',
      dontList: 'Traffic',
      latitude: 34.0440,
      longitude: -118.2480,
      taskType: 'planter',
      status: 'approved',
    },
  });

  const claimApproved = await prisma.claim.create({
    data: {
      id: 'claim-hist-approved',
      taskId: 'task-hist-approved',
      workerId: 'worker-austin-id',
      status: 'completed',
    },
  });

  const submissionApproved = await prisma.submission.create({
    data: {
      id: 'sub-hist-approved',
      taskId: 'task-hist-approved',
      workerId: 'worker-austin-id',
      claimId: 'claim-hist-approved',
      beforePhotos: '/task_thumbnail.png',
      afterPhotos: '/volunteers_working.png',
      notes: 'Watered all 4 planters.',
      status: 'approved',
    },
  });

  await prisma.review.create({
    data: {
      id: 'review-hist-approved',
      submissionId: 'sub-hist-approved',
      reviewerId: 'admin-id',
      decision: 'approve',
      reason: 'Perfect work, clear photos.',
      approvedAmount: 24.0,
    },
  });

  await prisma.payment.create({
    data: {
      id: 'pay-hist-approved',
      workerId: 'worker-austin-id',
      submissionId: 'sub-hist-approved',
      amount: 24.0,
      status: 'available',
    },
  });

  // Completed & Already Paid Task
  const taskPaid = await prisma.task.create({
    data: {
      id: 'task-hist-paid',
      title: 'Remove stickers at 6th & Spring',
      description: 'Remove stickers.',
      payoutAmount: 12.0,
      estimatedMinutes: 15,
      requiredTools: 'scraper',
      safetyNotes: 'Wear gloves.',
      doList: 'Scrape, Clean, Photos',
      dontList: 'Private property',
      latitude: 34.0442,
      longitude: -118.2492,
      taskType: 'cleanup',
      status: 'approved',
    },
  });

  const claimPaid = await prisma.claim.create({
    data: {
      id: 'claim-hist-paid',
      taskId: 'task-hist-paid',
      workerId: 'worker-austin-id',
      status: 'completed',
    },
  });

  const submissionPaid = await prisma.submission.create({
    data: {
      id: 'sub-hist-paid',
      taskId: 'task-hist-paid',
      workerId: 'worker-austin-id',
      claimId: 'claim-hist-paid',
      beforePhotos: '/task_thumbnail.png',
      afterPhotos: '/volunteers_working.png',
      notes: 'Stickers removed from light post.',
      status: 'approved',
    },
  });

  await prisma.review.create({
    data: {
      id: 'review-hist-paid',
      submissionId: 'sub-hist-paid',
      reviewerId: 'admin-id',
      decision: 'approve',
      reason: 'Looks good.',
      approvedAmount: 12.0,
    },
  });

  await prisma.payment.create({
    data: {
      id: 'pay-hist-paid',
      workerId: 'worker-austin-id',
      submissionId: 'sub-hist-paid',
      amount: 12.0,
      status: 'paid',
    },
  });

  // 5. Create some default Reports
  await prisma.report.create({
    data: {
      id: 'report-trash-broadway',
      userId: 'worker-austin-id',
      photoUrl: '/task_thumbnail.png',
      latitude: 34.0448,
      longitude: -118.2512,
      category: 'trash',
      note: 'Bulky trash pile dumped near alley entrance.',
      status: 'pending',
    },
  });

  await prisma.report.create({
    data: {
      id: 'report-graffiti-spring',
      userId: 'worker-austin-id',
      photoUrl: '/task_thumbnail.png',
      latitude: 34.0439,
      longitude: -118.2495,
      category: 'graffiti',
      note: 'Graffiti tagging on electrical box.',
      status: 'city_routed',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
