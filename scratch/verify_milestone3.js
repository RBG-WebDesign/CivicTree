// scratch/verify_milestone3.js
const path = require('path');
const { PrismaClient } = require(path.join(process.cwd(), 'src', 'generated', 'prisma'));
const { PrismaBetterSqlite3 } = require(path.join(process.cwd(), 'node_modules', '@prisma', 'adapter-better-sqlite3'));

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function verifyMilestone3() {
  console.log('--- STARTING MILESTONE 3 E2E VERIFICATION SCRIPT ---');

  // Test setup: clean prior runs
  const phone = '213-555-0122';
  await prisma.payment.deleteMany({ where: { workerId: 'worker-new-id' } });
  await prisma.review.deleteMany({});
  await prisma.submission.deleteMany({ where: { workerId: 'worker-new-id' } });
  await prisma.claim.deleteMany({ where: { workerId: 'worker-new-id' } });
  await prisma.report.deleteMany({ where: { userId: 'worker-new-id' } });
  await prisma.task.deleteMany({ where: { id: 'task-production-verification' } });

  // 1. Verify Twilio SMS send-code
  console.log('\n[Step 1] Requesting OTP verification code for phone:', phone);
  const sendRes = await fetch('http://localhost:3001/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!sendRes.ok) throw new Error('Send code API failed');
  const sendData = await sendRes.json();
  console.log(`-> Send OTP result:`, sendData);

  // 2. Verify OTP verify-code
  console.log('\n[Step 2] Verifying OTP verification code with credential bypass...');
  const verifyRes = await fetch('http://localhost:3001/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code: '123456' }), // Bypass code accepted in our mock
  });
  if (!verifyRes.ok) throw new Error('Verify code API failed');
  const verifyData = await verifyRes.json();
  console.log(`-> Auth result (User ID): ${verifyData.user.id}, Role: ${verifyData.user.role}, Redirect: ${verifyData.redirectUrl}`);

  // Create an open task for check-in test
  const task = await prisma.task.create({
    data: {
      id: 'task-production-verification',
      title: 'Water planter at 7th & Grand',
      description: 'Water the sidewalk planter.',
      payoutAmount: 25.0,
      estimatedMinutes: 20,
      requiredTools: 'watering can',
      safetyNotes: 'Watch traffic.',
      doList: 'Water planter, take photos',
      dontList: 'Do not work in street',
      latitude: 34.0450,
      longitude: -118.2510,
      status: 'open',
    },
  });

  const claim = await prisma.claim.create({
    data: {
      taskId: task.id,
      workerId: verifyData.user.id,
      status: 'claimed',
    },
  });

  // 3. Verify Geolocation Haversine Bounds check (Fail scenario)
  console.log('\n[Step 3] Verifying GPS check-in boundary validation (Far coordinate - Expect FAIL)...');
  const failCheckinRes = await fetch(`http://localhost:3001/api/tasks/${task.id}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      claimId: claim.id,
      latitude: 34.1000, // Very far coordinate (Hollywood area)
      longitude: -118.3000,
    }),
  });
  console.log(`-> Check-in response status: ${failCheckinRes.status}`);
  const failCheckinData = await failCheckinRes.json();
  console.log(`-> Check-in failure details: "${failCheckinData.error}"`);
  if (failCheckinRes.status !== 400) {
    throw new Error('Distance restriction failed to block far coordinate check-in');
  }

  // 3b. Verify Geolocation Haversine Bounds check (Pass scenario)
  console.log('\n[Step 3b] Verifying GPS check-in boundary validation (Close coordinate - Expect PASS)...');
  const passCheckinRes = await fetch(`http://localhost:3001/api/tasks/${task.id}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      claimId: claim.id,
      latitude: 34.0452, // Close coordinate (within 50 meters)
      longitude: -118.2512,
    }),
  });
  if (!passCheckinRes.ok) throw new Error('Valid GPS check-in was blocked');
  const passCheckinData = await passCheckinRes.json();
  console.log(`-> Check-in success. Claim status: "${passCheckinData.status}"`);

  // 4. Verify Photo upload returning S3 url format
  console.log('\n[Step 4] Simulating file upload to mock cloud (S3)...');
  // Trigger file upload API simulation
  const formData = new FormData();
  formData.append('file', new Blob(['fake image buffer'], { type: 'image/jpeg' }), 'evidence.jpg');
  
  const uploadRes = await fetch('http://localhost:3001/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!uploadRes.ok) throw new Error('Upload API failed');
  const uploadData = await uploadRes.json();
  console.log(`-> Upload response:`, uploadData);

  // 5. Verify task submission with AI verification tags
  console.log('\n[Step 5] Submitting task completion proof...');
  const submitRes = await fetch(`http://localhost:3001/api/tasks/${task.id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId: verifyData.user.id,
      claimId: claim.id,
      beforePhotos: uploadData.url,
      afterPhotos: uploadData.url,
      notes: 'Planter watered.',
    }),
  });
  if (!submitRes.ok) throw new Error('Submit task proof failed');
  const submitData = await submitRes.json();
  console.log(`-> Submit result notes (Includes AI Audit): "${submitData.submission.notes}"`);

  // 6. Verify Biohazard report webhook trigger
  console.log('\n[Step 6] Worker reports a biohazard problem (Needles)...');
  const reportRes = await fetch('http://localhost:3001/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: verifyData.user.id,
      category: 'biohazard',
      note: 'Needle spotted in the planter well.',
      latitude: 34.0450,
      longitude: -118.2510,
      photoUrl: uploadData.url,
    }),
  });
  if (!reportRes.ok) throw new Error('Report API failed');
  const reportData = await reportRes.json();
  console.log(`-> Report created status: ${reportData.status}, Category: ${reportData.category}`);

  // Approve payment for cashout verification
  await prisma.payment.update({
    where: { submissionId: submitData.submission.id },
    data: { status: 'available' },
  });

  // 7. Verify Stripe Payout Cash Out API
  console.log('\n[Step 7] Worker cash out available Stripe Connect balances...');
  const cashoutRes = await fetch('http://localhost:3001/api/payouts/cashout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workerId: verifyData.user.id }),
  });
  if (!cashoutRes.ok) throw new Error('Stripe Connect payout API failed');
  const cashoutData = await cashoutRes.json();
  console.log(`-> Stripe Connect payout result:`, cashoutData);

  console.log('\n--- MILESTONE 3 E2E VERIFICATION SCRIPT SUCCESS ---');
}

verifyMilestone3()
  .catch((err) => {
    console.error('\n!!! VERIFICATION FAILURE:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
