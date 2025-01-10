'use server';

import { database } from '@/lib/database';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { baseUrl } from '@repo/lib/consts';
import { parseError } from '@repo/lib/parse-error';
import { stripe } from '@repo/payments';
import { NextResponse } from 'next/server';

export const GET = async (request: Request): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const priceId = searchParams.get('priceId');

  try {
    if (!priceId) {
      throw new Error('Price ID not found');
    }

    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('User or organization not found');
    }

    const [databaseOrganization, members] = await Promise.all([
      database.organization.findFirst({
        where: { id: organizationId },
      }),
      currentMembers(),
    ]);

    if (!databaseOrganization) {
      throw new Error('Organization not found');
    }

    if (!user.email) {
      throw new Error('Email address not found');
    }

    let { stripeCustomerId } = databaseOrganization;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
      });

      stripeCustomerId = customer.id;

      await database.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      customer: stripeCustomerId,
      customer_update: {
        address: 'auto',
      },
      line_items: [
        {
          price: priceId,
          quantity: members.length,
        },
      ],
      mode: 'subscription',
      metadata: {
        userId: user.id,
        organizationId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          organizationId,
        },
        trial_period_days: 15,
      },
      success_url: baseUrl,
      cancel_url: baseUrl,
      automatic_tax: { enabled: true },
    });

    if (!session.url) {
      throw new Error('Session URL not found');
    }

    return NextResponse.redirect(session.url);
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 500 });
  }
};
