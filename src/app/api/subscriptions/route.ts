import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['Build unlimited projects', 'Visual builder', 'Basic blocks'],
    limits: { deployments: 0, projects: Infinity, aiRequests: 10 },
  },
  pro: {
    name: 'Pro',
    price: 15,
    features: ['Everything in Free', 'Shared hosting', 'Unlimited deployments', 'Advanced blocks', 'Priority support'],
    limits: { deployments: 5, projects: Infinity, aiRequests: 1000 },
  },
  business: {
    name: 'Business',
    price: 49,
    features: ['Everything in Pro', 'Dedicated containers', 'Custom domains', 'Advanced analytics', 'API access'],
    limits: { deployments: 20, projects: Infinity, aiRequests: 10000 },
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    features: ['Everything in Business', 'Private infrastructure', 'SLA guarantee', 'Custom integrations', 'Dedicated support'],
    limits: { deployments: Infinity, projects: Infinity, aiRequests: Infinity },
  },
};

export async function GET() {
  return NextResponse.json({ tiers: SUBSCRIPTION_TIERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tier } = body;
    
    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'User ID and tier are required' },
        { status: 400 }
      );
    }
    
    if (!SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }
    
    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { billing: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user subscription
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionEnds: tier !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });
    
    // Update billing
    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    await db.billing.upsert({
      where: { userId },
      update: {
        tier,
        amount: tierConfig.price,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      create: {
        userId,
        tier,
        amount: tierConfig.price,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    });
    
    return NextResponse.json({
      user: updatedUser,
      tier: tierConfig,
      message: `Successfully upgraded to ${tierConfig.name} plan`,
    });
    
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}