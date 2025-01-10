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
      platform: 'ATLASSIAN',
    },
    select: { id: true },
  });

  const atlassianUrl = new URL('https://auth.atlassian.com/authorize');

  atlassianUrl.searchParams.set('audience', 'api.atlassian.com');
  atlassianUrl.searchParams.set('client_id', env.ATLASSIAN_CLIENT_ID);
  atlassianUrl.searchParams.set(
    'scope',
    [
      // Read Jira project and issue data, search for issues, and objects associated with issues like attachments and worklogs.
      'read:jira-work',

      // Create and edit issues in Jira, post comments as the user, create worklogs, and delete issues.
      'write:jira-work',

      // Register and manage Jira webhooks.
      'manage:jira-webhook',

      // Manage development and release information for third parties in Jira.
      'manage:jira-data-provider',

      // Needed to get refresh token as well, instead of just an access token.
      'offline_access',
    ].join(' ')
  );
  atlassianUrl.searchParams.set(
    'redirect_uri',
    new URL('/callbacks/jira', baseUrl).toString()
  );
  atlassianUrl.searchParams.set('state', state.id);
  atlassianUrl.searchParams.set('response_type', 'code');
  atlassianUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(atlassianUrl.toString());
};
