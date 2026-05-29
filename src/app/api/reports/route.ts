// src/app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, category, note, latitude, longitude, photoUrl } = body;

    if (!userId || !category || !note) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        userId,
        category,
        note,
        latitude: parseFloat(latitude) || 34.0450,
        longitude: parseFloat(longitude) || -118.2510,
        photoUrl: photoUrl || '/task_thumbnail.png',
        status: 'pending',
      },
    });

    if (category === 'biohazard') {
      console.log(`\n======================================================`);
      console.log(`[CITY 311 TRIAGE WEBHOOK] Triggered outbound webhook for biohazard!`);
      console.log(`Endpoint: https://api.losangeles.gov/v1/311/triage`);
      console.log(`Payload: ${JSON.stringify({
        reportId: report.id,
        category,
        note,
        coordinates: { latitude, longitude }
      }, null, 2)}`);
      console.log(`======================================================\n`);
    }

    console.log(`Created problem report with ID: ${report.id}`);
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Failed to create report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
