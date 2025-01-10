import { env } from '@/env';
import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { NextResponse } from 'next/server';

export const GET = async (): Promise<Response> => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    throw new Error('Unauthorized');
  }

  const state = await database.installationState.create({
    data: {
      organizationId,
      creatorId: user.id,
      platform: 'INTERCOM',
    },
    select: { id: true },
  });

  const intercomUrl = new URL('https://app.intercom.com/oauth');

  intercomUrl.searchParams.set('client_id', env.INTERCOM_CLIENT_ID);
  intercomUrl.searchParams.set('state', state.id);

  return NextResponse.redirect(intercomUrl.toString());
};
