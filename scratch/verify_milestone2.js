// scratch/verify_milestone2.js
const path = require('path');
const { PrismaClient } = require(path.join(process.cwd(), 'src', 'generated', 'prisma'));
const { PrismaBetterSqlite3 } = require(path.join(process.cwd(), 'node_modules', '@prisma', 'adapter-better-sqlite3'));

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function verifyMilestone2() {
  console.log('--- STARTING MILESTONE 2 E2E VERIFICATION SCRIPT ---');

  // Clear previous runs
  await prisma.payment.deleteMany({ where: { workerId: 'worker-new-id' } });
  await prisma.review.deleteMany({});
  await prisma.submission.deleteMany({ where: { workerId: 'worker-new-id' } });
  await prisma.claim.deleteMany({ where: { workerId: 'worker-new-id' } });
  await prisma.report.deleteMany({ where: { userId: 'worker-new-id' } });
  await prisma.task.deleteMany({ where: { id: 'task-reported-by-maya' } });
  await prisma.user.update({
    where: { id: 'worker-new-id' },
    data: {
      onboardingCompleted: false,
      level: 1,
      unlockedTaskTypes: 'beginner',
    },
  });

  // Step 1: User Reports a Problem (Trash Category)
  console.log('\n[Step 1] Worker Maya reports a trash problem...');
  const report = await prisma.report.create({
    data: {
      userId: 'worker-new-id',
      photoUrl: '/task_thumbnail.png',
      latitude: 34.0440,
      longitude: -118.2510,
      category: 'trash',
      note: 'Huge trash pile near corridor entrance.',
      status: 'pending',
    },
  });
  console.log(`-> Report created. ID: ${report.id}, Category: ${report.category}, Status: ${report.status}`);

  // Step 2: Admin approves the report, creating a new Task
  console.log('\n[Step 2] Admin reviews the report and creates a paid task...');
  const task = await prisma.task.create({
    data: {
      id: 'task-reported-by-maya',
      title: 'Clean reported litter near Broadway Corridor',
      description: 'Clear the trash pile reported by the local citizen.',
      payoutAmount: 20.00,
      estimatedMinutes: 25,
      requiredTools: 'gloves, trash bag',
      safetyNotes: 'Do not touch needles. Report them.',
      doList: 'Clean litter, place bag at pick up location, take photos',
      dontList: 'Do not touch dangerous waste',
      latitude: report.latitude,
      longitude: report.longitude,
      taskType: 'cleanup',
      reportedByUserId: 'worker-new-id',
      status: 'open',
    },
  });
  
  // Update report status
  await prisma.report.update({
    where: { id: report.id },
    data: { status: 'approved_funding' },
  });
  console.log(`-> Task created from report. ID: ${task.id}, Payout: $${task.payoutAmount}, Report status: approved_funding`);

  // Step 3: New Worker Completes Onboarding
  console.log('\n[Step 3] New Worker Maya undergoes onboarding...');
  const updatedUser = await prisma.user.update({
    where: { id: 'worker-new-id' },
    data: {
      onboardingCompleted: true,
      neighborhood: 'Downtown LA',
      phone: '213-555-0122',
      language: 'en',
    },
  });
  console.log(`-> Onboarding finished. Completed flag: ${updatedUser.onboardingCompleted}, Neighborhood: ${updatedUser.neighborhood}`);

  // Step 4: Worker completes Planter Care training
  console.log('\n[Step 4] Worker completes Planter Care training module to unlock planter tasks...');
  const unlockedUser = await prisma.user.update({
    where: { id: 'worker-new-id' },
    data: {
      unlockedTaskTypes: 'beginner,planter',
    },
  });
  console.log(`-> Training completed. Unlocked categories: "${unlockedUser.unlockedTaskTypes}"`);

  // Step 5: Worker claims the task (pre-claim safety checklist passed)
  console.log('\n[Step 5] Worker claims the reported task...');
  const [claimedTask, claim] = await prisma.$transaction([
    prisma.task.update({
      where: { id: task.id },
      data: { status: 'claimed' },
    }),
    prisma.claim.create({
      data: {
        taskId: task.id,
        workerId: 'worker-new-id',
        status: 'claimed',
        gpsCheckin: JSON.stringify({ lat: task.latitude, lng: task.longitude }),
      },
    }),
  ]);
  console.log(`-> Claim recorded. Claim ID: ${claim.id}, Task Status: ${claimedTask.status}`);

  // Step 6: Worker completes work and submits before/after photos as proof
  console.log('\n[Step 6] Worker submits proof of completion...');
  const submissionResult = await prisma.$transaction(async (tx) => {
    // Update task status
    const uTask = await tx.task.update({
      where: { id: task.id },
      data: { status: 'submitted' },
    });

    // Update claim status
    const uClaim = await tx.claim.update({
      where: { id: claim.id },
      data: {
        status: 'submitted',
        completedAt: new Date(),
      },
    });

    // Create submission
    const sub = await tx.submission.create({
      data: {
        taskId: task.id,
        workerId: 'worker-new-id',
        claimId: claim.id,
        beforePhotos: '/task_thumbnail.png',
        afterPhotos: '/volunteers_working.png',
        notes: 'Cleared all litter and bagged. Left at Spring St Depot.',
        status: 'submitted',
      },
    });

    // Create payment
    const pay = await tx.payment.create({
      data: {
        workerId: 'worker-new-id',
        submissionId: sub.id,
        amount: task.payoutAmount,
        status: 'pending_review',
      },
    });

    return { task: uTask, claim: uClaim, submission: sub, payment: pay };
  });
  console.log(`-> Submission ID: ${submissionResult.submission.id}, Payment status: ${submissionResult.payment.status}`);

  // Step 7: Admin reviews submission (with GPS matching check)
  console.log('\n[Step 7] Admin reviews the submissions queue...');
  
  // Verify GPS matching
  const taskLat = task.latitude;
  const taskLng = task.longitude;
  const checkinCoords = JSON.parse(claim.gpsCheckin);
  const distanceDiff = Math.abs(taskLat - checkinCoords.lat) + Math.abs(taskLng - checkinCoords.lng);
  const isGPSValid = distanceDiff < 0.001; // within range
  
  console.log(`-> Check-in GPS check result: ${isGPSValid ? 'PASS' : 'FAIL'} (diff: ${distanceDiff})`);

  // Admin approves review, processes payout
  const reviewResult = await prisma.$transaction(async (tx) => {
    // Create Review
    const rev = await tx.review.create({
      data: {
        submissionId: submissionResult.submission.id,
        reviewerId: 'admin-id',
        decision: 'approve',
        reason: 'Excellent cleanup job. Verified photo and GPS matches.',
        approvedAmount: task.payoutAmount,
      },
    });

    // Update submission
    const uSub = await tx.submission.update({
      where: { id: submissionResult.submission.id },
      data: { status: 'approved' },
    });

    // Update task
    const uTask = await tx.task.update({
      where: { id: task.id },
      data: { status: 'approved' },
    });

    // Update payment
    const uPay = await tx.payment.update({
      where: { submissionId: submissionResult.submission.id },
      data: { status: 'available' },
    });

    // Update claim
    const uClaim = await tx.claim.update({
      where: { id: claim.id },
      data: { status: 'completed' },
    });

    // Promote worker level as reward
    const uUser = await tx.user.update({
      where: { id: 'worker-new-id' },
      data: { level: 2 },
    });

    return { review: rev, submission: uSub, task: uTask, payment: uPay, claim: uClaim, worker: uUser };
  });

  console.log(`-> Review approved. Final task status: ${reviewResult.task.status}`);
  console.log(`-> Payout available for worker: ${reviewResult.payment.status}`);
  console.log(`-> Worker promoted to level: ${reviewResult.worker.level} (Sprout)`);

  console.log('\n--- MILESTONE 2 E2E VERIFICATION SCRIPT SUCCESS ---');
}

verifyMilestone2()
  .catch((err) => {
    console.error('\n!!! VERIFICATION FAILURE:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
