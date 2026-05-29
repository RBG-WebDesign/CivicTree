// src/app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      payoutAmount,
      estimatedMinutes,
      requiredTools,
      safetyNotes,
      doList,
      dontList,
      latitude,
      longitude,
    } = body;

    // Validation
    if (!title || !description || !payoutAmount || !estimatedMinutes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        payoutAmount: parseFloat(payoutAmount),
        estimatedMinutes: parseInt(estimatedMinutes),
        requiredTools: requiredTools || '',
        safetyNotes: safetyNotes || '',
        doList: doList || '',
        dontList: dontList || '',
        latitude: parseFloat(latitude) || 34.0456,
        longitude: parseFloat(longitude) || -118.2505,
        status: 'open',
      },
    });

    console.log(`Created task with ID: ${task.id}`);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
