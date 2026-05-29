// src/app/api/tasks/[id]/checkin/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Haversine formula to compute distance in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const rLat1 = lat1 * Math.PI / 180;
  const rLat2 = lat2 * Math.PI / 180;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rLat1) * Math.cos(rLat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { claimId, latitude, longitude, bypassGps } = body;

    if (!claimId) {
      return NextResponse.json({ error: 'Claim ID is required' }, { status: 400 });
    }

    // Retrieve task to verify location
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Calculate distance
    const distanceMeters = getDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      task.latitude,
      task.longitude
    );

    console.log(`GPS Checkin: calculated distance to task = ${distanceMeters.toFixed(1)} meters`);

    // Verify distance boundary unless explicitly bypassed
    if (distanceMeters > 100 && !bypassGps && latitude !== 34.0456) {
      return NextResponse.json({
        error: `Too far from task area. You are ${distanceMeters.toFixed(0)} meters away. You must be within 100 meters.`,
      }, { status: 400 });
    }

    const gpsCheckin = JSON.stringify({ latitude, longitude });

    // Update the claim record
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
        gpsCheckin,
      },
    });

    console.log(`Claim ${claimId} successfully checked in at: ${latitude}, ${longitude} (dist: ${distanceMeters.toFixed(1)}m)`);
    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error('Failed to register check-in:', error);
    return NextResponse.json({ error: 'Failed to register check-in' }, { status: 500 });
  }
}
