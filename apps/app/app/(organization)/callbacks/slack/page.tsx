import { env } from '@/env';
import { database } from '@/lib/database';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { baseUrl } from '@repo/lib/consts';
import { createMetadata } from '@repo/seo/metadata';
import { WebClient as Slack } from '@repo/slack';
import type { OauthV2AccessResponse } from '@repo/slack';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = createMetadata({
  title: 'Processing',
  description: 'Please wait while we process your request.',
});

type SlackCallbackPageProperties = {
  readonly searchParams: Promise<Record<string, string>>;
};

const SlackCallbackPage = async (props: SlackCallbackPageProperties) => {
  const searchParams = await props.searchParams;
  const { code, state, error, error_description } = searchParams;
  const slack = new Slack();

  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (error) {
    throw new Error(error_description);
  }

  if (!user || !organizationId || !code || !state) {
    notFound();
  }

  const installationState = await database.installationState.count({
    where: {
      id: state,
      platform: 'SLACK',
      creatorId: user.id,
    },
  });

  if (!installationState) {
    throw new Error('State parameter is invalid');
  }

  await database.installationState.delete({
    where: { id: state },
    select: { id: true },
  });

  // Error: An API error occurred: missing_scope
  let data: OauthV2AccessResponse | null = null;

  try {
    data = await slack.oauth.v2.access({
      client_id: env.SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: new URL('/callbacks/slack', baseUrl).toString(),
    });
  } catch (slackError) {
    throw new Error(JSON.stringify(slackError));
  }

  if (!data.ok || data.error) {
    throw new Error(data.error);
  }

  if (
    !data.access_token ||
    !data.token_type ||
    !data.scope ||
    !data.bot_user_id ||
    !data.app_id ||
    !data.team?.name ||
    !data.team.id ||
    !data.authed_user?.id ||
    !data.incoming_webhook?.channel ||
    !data.incoming_webhook.channel_id ||
    !data.incoming_webhook.configuration_url ||
    !data.incoming_webhook.url
  ) {
    throw new Error('Invalid response from Slack');
  }

  const installation = await database.slackInstallation.create({
    data: {
      organizationId,
      creatorId: user.id,

      accessToken: data.access_token,
      tokenType: data.token_type,
      scope: data.scope,
      botUserId: data.bot_user_id,
      appId: data.app_id,

      teamName: data.team.name,
      teamId: data.team.id,

      authedUserId: data.authed_user.id,

      incomingWebhookChannel: data.incoming_webhook.channel,
      incomingWebhookChannelId: data.incoming_webhook.channel_id,
      incomingWebhookConfigurationUrl: data.incoming_webhook.configuration_url,
      incomingWebhookUrl: data.incoming_webhook.url,
    },
    select: {
      organization: {
        select: {
          slug: true,
        },
      },
    },
  });

  await slack.conversations.join({
    token: data.access_token,
    channel: data.incoming_webhook.channel_id,
  });

  await slack.chat.postMessage({
    token: data.access_token,
    channel: data.incoming_webhook.channel_id,
    text: "Hello from Eververse! :wave: Whenever new feedback comes in, we'll post it here.",
  });

  return redirect(`/${installation.organization.slug}/settings/integrations`);
};

export default SlackCallbackPage;
