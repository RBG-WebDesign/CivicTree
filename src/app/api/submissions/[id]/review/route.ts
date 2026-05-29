// src/app/api/submissions/[id]/review/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reviewerId, decision, reason } = body; // decision: 'approve' | 'reject'

    if (!reviewerId || !decision) {
      return NextResponse.json({ error: 'Reviewer ID and Decision are required' }, { status: 400 });
    }

    if (decision !== 'approve' && decision !== 'reject') {
      return NextResponse.json({ error: 'Invalid decision type' }, { status: 400 });
    }

    // Verify submission exists and needs review
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { task: true, payments: true },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.status !== 'submitted') {
      return NextResponse.json(
        { error: `Submission has already been processed with status: ${submission.status}` },
        { status: 400 }
      );
    }

    // Run in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Review record
      const review = await tx.review.create({
        data: {
          submissionId: id,
          reviewerId,
          decision,
          reason: reason || '',
          approvedAmount: decision === 'approve' ? submission.task.payoutAmount : 0.0,
        },
      });

      // 2. Update Submission status
      const updatedSubmission = await tx.submission.update({
        where: { id },
        data: {
          status: decision === 'approve' ? 'approved' : 'rejected',
        },
      });

      // 3. Update Task status
      // If approved, task status is 'approved'
      // If rejected, task status reverts to 'open' so other workers can claim it!
      const updatedTask = await tx.task.update({
        where: { id: submission.taskId },
        data: {
          status: decision === 'approve' ? 'approved' : 'open',
        },
      });

      // 4. Update Payment record status
      let updatedPayment = null;
      const paymentRecord = await tx.payment.findUnique({
        where: { submissionId: id },
      });

      if (paymentRecord) {
        updatedPayment = await tx.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: decision === 'approve' ? 'available' : 'rejected',
          },
        });
      }

      // 5. Update claim status if approved
      await tx.claim.update({
        where: { id: submission.claimId },
        data: {
          status: decision === 'approve' ? 'completed' : 'canceled',
        },
      });

      return { review, submission: updatedSubmission, task: updatedTask, payment: updatedPayment };
    });

    console.log(`Submission ${id} successfully reviewed. Decision: ${decision}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
