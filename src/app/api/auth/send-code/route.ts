// src/app/api/auth/send-code/route.ts
import { NextResponse } from 'next/server';

const globalForOtp = globalThis as unknown as {
  otpCache: Map<string, string> | undefined;
};

if (!globalForOtp.otpCache) {
  globalForOtp.otpCache = new Map<string, string>();
}

export const otpCache = globalForOtp.otpCache;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in process memory cache
    otpCache.set(phone.trim(), code);

    // Simulate Twilio console log output
    console.log(`\n======================================================`);
    console.log(`[TWILIO SMS SIMULATOR] Sent code ${code} to ${phone}`);
    console.log(`======================================================\n`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
