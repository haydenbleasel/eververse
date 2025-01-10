import { database } from '@/lib/database';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { baseUrl } from '@repo/lib/consts';
import { parseError } from '@repo/lib/parse-error';
import { stripe } from '@repo/payments';
import { NextResponse } from 'next/server';

export const GET = async (): Promise<Response> => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return new Response(null, { status: 404 });
  }

  const databaseOrganization = await database.organization.findFirst({
    where: { id: organizationId },
    select: { stripeCustomerId: true },
  });

  if (!databaseOrganization) {
    return new Response(null, { status: 404 });
  }

  const { stripeCustomerId } = databaseOrganization;

  if (!stripeCustomerId) {
    return new Response(null, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: baseUrl,
    });

    return NextResponse.redirect(session.url, { status: 302 });
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 500 });
  }
};
