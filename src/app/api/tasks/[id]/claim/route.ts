// src/app/api/tasks/[id]/claim/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { workerId } = body;

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    // Verify task exists and is open
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.status !== 'open') {
      return NextResponse.json({ error: 'Task is not open' }, { status: 400 });
    }

    // Run in a transaction
    const [updatedTask, claim] = await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: { status: 'claimed' },
      }),
      prisma.claim.create({
        data: {
          taskId: id,
          workerId,
          status: 'claimed',
        },
      }),
    ]);

    console.log(`Task ${id} successfully claimed by worker ${workerId}. Claim ID: ${claim.id}`);
    return NextResponse.json({ task: updatedTask, claim });
  } catch (error) {
    console.error('Failed to claim task:', error);
    return NextResponse.json({ error: 'Failed to claim task' }, { status: 500 });
  }
}
