// src/app/api/claims/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const workerId = searchParams.get('workerId');

    if (!taskId || !workerId) {
      return NextResponse.json({ error: 'Missing taskId or workerId params' }, { status: 400 });
    }

    // Find the latest claim that is not completed or canceled,
    // or the one that is currently active/submitted.
    const claim = await prisma.claim.findFirst({
      where: {
        taskId,
        workerId,
        status: { in: ['claimed', 'in_progress', 'submitted'] },
      },
      orderBy: {
        claimedAt: 'desc',
      },
    });

    return NextResponse.json(claim || null);
  } catch (error) {
    console.error('Failed to query claims:', error);
    return NextResponse.json({ error: 'Failed to query claims' }, { status: 500 });
  }
}
