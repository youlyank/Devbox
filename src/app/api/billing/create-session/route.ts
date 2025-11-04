import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const PRICES = {
  pro: 'price_1OxyzR2eZvKYlo2C6s2xXlZc', // $15/month
  business: 'price_1Oxyzs2eZvKYlo2C6w9rLkZmN', // $49/month
  enterprise: 'price_1Oxyzt2eZvKYlo2C6v8mNqOp', // $199/month
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tier, successUrl, cancelUrl } = body;

    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'User ID and tier are required' },
        { status: 400 }
      );
    }

    if (!PRICES[tier as keyof typeof PRICES]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get user info
    const userResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/users?id=${userId}`);
    const userData = await userResponse.json();

    if (!userData.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userData.user;

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await fetch(`${process.env.NEXTAUTH_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripeCustomerId: customerId,
        }),
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICES[tier as keyof typeof PRICES],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}