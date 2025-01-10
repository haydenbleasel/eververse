import { env } from '@/env';
import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { baseUrl } from '@repo/lib/consts';
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
      platform: 'LINEAR',
    },
    select: { id: true },
  });

  const linearUrl = new URL('https://linear.app/oauth/authorize');

  linearUrl.searchParams.set('client_id', env.LINEAR_CLIENT_ID);
  linearUrl.searchParams.set(
    'redirect_uri',
    new URL('/callbacks/linear', baseUrl).toString()
  );
  linearUrl.searchParams.set('response_type', 'code');
  linearUrl.searchParams.set(
    'scope',
    ['read', 'write', 'issues:create', 'comments:create'].join(',')
  );
  linearUrl.searchParams.set('state', state.id);
  linearUrl.searchParams.set('prompt', 'consent');
  linearUrl.searchParams.set('actor', 'application');

  return NextResponse.redirect(linearUrl.toString());
};
