import { env } from '@/env';
import { database } from '@repo/backend/database';
import { log } from '@repo/observability/log';
import { stripe } from '@repo/payments';
import type { Stripe } from '@repo/payments';
import { NextResponse } from 'next/server';
import { z } from 'zod/v3';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const handleSubscriptionCreation = async (
  event: Stripe.CustomerSubscriptionCreatedEvent
): Promise<Response> => {
  const subscription = event.data.object;
  const metadataSchema = z.object({
    userId: z.string(),
    organizationId: z.string(),
  });

  const parse = metadataSchema.safeParse(subscription.metadata);

  if (!parse.success) {
    return new Response(
      `Invalid Stripe metadata: ${parse.error.errors.join(', ')}`,
      { status: 400 }
    );
  }

  const { organizationId } = parse.data;

  let stripeCustomerId: string | null = null;

  if (typeof subscription.customer === 'string') {
    stripeCustomerId = subscription.customer;
  } else if (subscription.customer.deleted) {
    return new Response('Customer was deleted', { status: 400 });
  } else {
    stripeCustomerId = subscription.customer.id;
  }

  if (subscription.items.data.length === 0) {
    return new Response('No subscription items', { status: 400 });
  }

  await database.organization.update({
    where: { id: organizationId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId,
    },
    select: { id: true },
  });

  return new Response('OK', { status: 200 });
};

const handleSubscriptionDeletion = async (
  event: Stripe.CustomerSubscriptionDeletedEvent
): Promise<Response> => {
  const subscription = event.data.object;

  const organization = await database.organization.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true },
  });

  if (!organization) {
    return new Response('Organization already deleted', { status: 200 });
  }

  await database.organization.update({
    where: { id: organization.id },
    data: { stripeSubscriptionId: null },
    select: { id: true },
  });

  return new Response('OK', { status: 200 });
};

export const POST = async (request: Request): Promise<Response> => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'customer.subscription.created': {
      return handleSubscriptionCreation(event);
    }
    case 'customer.subscription.deleted': {
      return handleSubscriptionDeletion(event);
    }
    default: {
      log.warn(`Unhandled event type ${event.type}`);
    }
  }

  return NextResponse.json({ result: event, ok: true });
};
