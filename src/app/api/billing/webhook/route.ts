import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId || !tier) {
    console.error('Missing metadata in checkout session');
    return;
  }

  try {
    // Update user subscription
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      },
    });

    // Update billing record
    await db.billing.upsert({
      where: { userId },
      update: {
        tier,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: getTierPrice(tier),
      },
      create: {
        userId,
        tier,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: getTierPrice(tier),
      },
    });

    console.log(`User ${userId} upgraded to ${tier} subscription`);
  } catch (error) {
    console.error('Failed to update user subscription:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;
    const tier = subscription.metadata?.tier;

    if (!userId || !tier) {
      console.error('Missing metadata in subscription');
      return;
    }

    // Update billing period
    await db.billing.update({
      where: { userId },
      data: {
        status: 'active',
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Payment succeeded for user ${userId}, subscription ${tier}`);
  } catch (error) {
    console.error('Failed to handle successful payment:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('Missing userId in subscription');
      return;
    }

    // Update billing status
    await db.billing.update({
      where: { userId },
      data: {
        status: 'past_due',
      },
    });

    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error('Failed to handle failed payment:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const tier = subscription.metadata?.tier;

  if (!userId || !tier) {
    console.error('Missing metadata in subscription update');
    return;
  }

  try {
    // Update user subscription
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionEnds: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
      },
    });

    // Update billing
    await db.billing.update({
      where: { userId },
      data: {
        tier,
        status: subscription.status === 'active' ? 'active' : 'canceled',
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    console.log(`Subscription updated for user ${userId}, tier ${tier}, status ${subscription.status}`);
  } catch (error) {
    console.error('Failed to update subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('Missing userId in subscription deletion');
    return;
  }

  try {
    // Downgrade to free tier
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'free',
        subscriptionEnds: null,
        stripeSubscriptionId: null,
      },
    });

    // Update billing
    await db.billing.update({
      where: { userId },
      data: {
        tier: 'free',
        status: 'canceled',
        amount: 0,
      },
    });

    console.log(`Subscription deleted for user ${userId}, downgraded to free`);
  } catch (error) {
    console.error('Failed to handle subscription deletion:', error);
  }
}

function getTierPrice(tier: string): number {
  switch (tier) {
    case 'pro': return 15;
    case 'business': return 49;
    case 'enterprise': return 199;
    default: return 0;
  }
}