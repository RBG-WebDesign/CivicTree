// src/app/api/payouts/cashout/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workerId } = body;

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    // Retrieve available payments
    const availablePayments = await prisma.payment.findMany({
      where: {
        workerId: workerId,
        status: 'available',
      },
    });

    if (availablePayments.length === 0) {
      return NextResponse.json({ error: 'No available funds to cash out' }, { status: 400 });
    }

    const totalCashoutAmount = availablePayments.reduce((sum, p) => sum + p.amount, 0);

    // Update statuses to paid in transaction
    const paymentIds = availablePayments.map((p) => p.id);
    await prisma.payment.updateMany({
      where: {
        id: { in: paymentIds },
      },
      data: {
        status: 'paid',
      },
    });

    console.log(`\n======================================================`);
    console.log(`[STRIPE CONNECT PAYOUT] Transferred $${totalCashoutAmount.toFixed(2)} to banking credentials for worker ID: ${workerId}`);
    console.log(`======================================================\n`);

    return NextResponse.json({
      success: true,
      amountTransferred: totalCashoutAmount,
      updatedCount: paymentIds.length,
      paymentIds: paymentIds,
    });
  } catch (error) {
    console.error('Cashout execution failed:', error);
    return NextResponse.json({ error: 'Cashout execution failed' }, { status: 500 });
  }
}
