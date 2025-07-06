import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';

// Initialize Stripe with the secret key
const stripe = new Stripe(Env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    // 1. Get the request body and Stripe signature header
    const text = await req.text();
    const sig = headers().get('stripe-signature');

    if (!sig) {
      logger.error('Missing Stripe signature');
      return new NextResponse('Missing Stripe signature', { status: 400 });
    }

    // 2. Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        text,
        sig,
        Env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      const error = err as Error;
      logger.error({ error: error.message }, 'Webhook signature verification failed');
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // 3. Handle the event based on its type
    logger.info({ eventType: event.type }, 'Processing Stripe webhook event');

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

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      default:
        logger.info({ eventType: event.type }, 'Unhandled event type');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ error }, 'Error handling webhook');
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Process a successful checkout session
  logger.info(
    {
      sessionId: session.id,
      customerId: session.customer,
    },
    'Checkout session completed',
  );

  // Update your database with subscription info if applicable
  if (session.subscription && session.customer) {
    await updateSubscriptionDetails(
      String(session.client_reference_id), // This should be your organization ID
      String(session.subscription),
    );
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Process a successful invoice payment
  if (!invoice.subscription || !invoice.customer) {
    logger.warn(
      { invoiceId: invoice.id },
      'Invoice payment succeeded but missing subscription or customer',
    );
    return;
  }

  logger.info(
    {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      customerId: invoice.customer,
    },
    'Invoice payment succeeded',
  );

  try {
    // Get subscription details to update the current_period_end
    const subscription = await stripe.subscriptions.retrieve(
      String(invoice.subscription),
    );

    // Find the organization that owns this subscription
    const { data: org } = await db
      .from('organization')
      .select('*')
      .eq('stripe_customer_id', String(invoice.customer))
      .single();

    if (!org) {
      logger.warn(
        { customerId: invoice.customer },
        'No organization found for customer ID',
      );
      return;
    }

    // Update subscription details
    await updateSubscriptionDetailsFromObject(org.id, subscription);
  } catch (error) {
    logger.error(
      { error, invoiceId: invoice.id },
      'Error processing invoice payment',
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Handle subscription updates or cancellations
  logger.info(
    {
      subscriptionId: subscription.id,
      status: subscription.status,
    },
    'Subscription changed',
  );

  try {
    // Find the organization by customer ID
    const { data: org } = await db
      .from('organization')
      .select('*')
      .eq('stripe_customer_id', String(subscription.customer))
      .single();

    if (!org) {
      logger.warn(
        { customerId: subscription.customer },
        'No organization found for customer ID',
      );
      return;
    }

    // Update subscription details
    await updateSubscriptionDetailsFromObject(org.id, subscription);
  } catch (error) {
    logger.error(
      { error, subscriptionId: subscription.id },
      'Error handling subscription change',
    );
  }
}

async function updateSubscriptionDetails(
  organizationId: string,
  subscriptionId: string,
) {
  try {
    // Get full subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await updateSubscriptionDetailsFromObject(organizationId, subscription);
  } catch (error) {
    logger.error(
      { error, organizationId, subscriptionId },
      'Error updating subscription details',
    );
  }
}

async function updateSubscriptionDetailsFromObject(
  organizationId: string,
  subscription: Stripe.Subscription,
) {
  try {
    // Get the price ID from the first item
    const priceId = subscription.items.data[0]?.price.id || null;

    // Update organization with subscription details
    const { error } = await db
      .from('organization')
      .update({
        stripe_customer_id: String(subscription.customer),
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
        stripe_subscription_price_id: priceId,
        stripe_subscription_current_period_end: subscription.current_period_end,
      })
      .eq('id', organizationId);

    if (error) {
      throw error;
    }

    logger.info(
      { organizationId, subscriptionId: subscription.id },
      'Updated organization subscription details',
    );
  } catch (error) {
    logger.error(
      { error, organizationId, subscriptionId: subscription.id },
      'Error updating subscription details in database',
    );
  }
}
