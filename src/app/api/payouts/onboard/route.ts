// src/app/api/payouts/onboard/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Return mock Stripe express dashboard onboarding link
    const stripeOnboardUrl = `/worker/profile?stripe_connected=true&user_id=${userId}`;
    console.log(`[STRIPE GATEWAY] Generated Express onboarding link for user ${userId}: ${stripeOnboardUrl}`);

    return NextResponse.json({ url: stripeOnboardUrl });
  } catch (error) {
    console.error('Stripe onboard failed:', error);
    return NextResponse.json({ error: 'Stripe onboard failed' }, { status: 500 });
  }
}
