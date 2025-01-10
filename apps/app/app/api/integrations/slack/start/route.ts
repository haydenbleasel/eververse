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
      platform: 'SLACK',
    },
    select: { id: true },
  });

  const slackUrl = new URL('https://slack.com/oauth/v2/authorize');

  slackUrl.searchParams.set('client_id', env.SLACK_CLIENT_ID);
  slackUrl.searchParams.set(
    'scope',
    [
      // View the name, email domain, and icon for workspaces your slack app is connected to
      'team:read',

      // View email addresses of people in a workspace
      'users:read',
      'users:read.email',

      // Create one-way webhooks to post messages to a specific channel
      'incoming-webhook',

      // Add shortcuts and/or slash commands that people can use
      'commands',

      // Join public channels in a workspace
      'channels:join',

      // Post messages in approved channels & conversations
      'chat:write',
    ].join(',')
  );
  slackUrl.searchParams.set(
    'redirect_uri',
    new URL('/callbacks/slack', baseUrl).toString()
  );
  slackUrl.searchParams.set('state', state.id);

  return NextResponse.redirect(slackUrl.toString());
};
