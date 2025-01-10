import { database } from '@repo/backend/database';
import { textToContent } from '@repo/editor/lib/tiptap';
import { MAX_FREE_FEEDBACK } from '@repo/lib/consts';
import { getGravatarUrl } from '@repo/lib/gravatar';
import { log } from '@repo/observability/log';
import { WebClient as Slack } from '@repo/slack';
import { friendlyWords } from 'friendlier-words';
import type { NextRequest } from 'next/server';

type MessageActionProperties = {
  token: string;
  callback_id: string;
  type: 'message_action';
  trigger_id: string;
  response_url: string;
  team: {
    id: string;
    domain: string;
  };
  channel: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
  message: {
    type: string;
    user: string;
    ts: string;
    text: string;
  };
};

const handleCreateFeedback = async (
  data: MessageActionProperties
): Promise<Response> => {
  const installation = await database.slackInstallation.findFirst({
    where: { teamId: data.team.id },
  });
  const slack = new Slack();

  if (!installation) {
    log.error('🔗 Slack Error: No installation', { teamId: data.team.id });
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await slack.users.info({
    token: installation.accessToken,
    user: data.user.id,
  });

  if (!user.ok) {
    log.error('🔗 Slack Error: User not found', { userId: data.user.id });
    return new Response('Unauthorized', { status: 401 });
  }

  let feedbackUserId: string | undefined;

  if (user.user?.profile?.email) {
    const feedbackUser = await database.feedbackUser.findFirst({
      where: {
        email: user.user.profile.email,
        organizationId: installation.organizationId,
      },
      select: { id: true },
    });

    if (feedbackUser) {
      feedbackUserId = feedbackUser.id;
    } else {
      const createdFeedbackUser = await database.feedbackUser.create({
        data: {
          email: user.user.profile.email,
          name:
            user.user.real_name ??
            user.user.name ??
            user.user.profile.display_name ??
            friendlyWords(2, ' '),
          imageUrl:
            user.user.profile.image_original ??
            (await getGravatarUrl(user.user.profile.email)),
          organizationId: installation.organizationId,
          source: 'SLACK',
        },
        select: { id: true },
      });

      feedbackUserId = createdFeedbackUser.id;
    }
  }

  const existingFeedback = await database.feedback.count({
    where: {
      organizationId: installation.organizationId,
      createdAt: new Date(data.message.ts),
      source: 'SLACK',
      feedbackUserId,
    },
  });

  if (existingFeedback > 0) {
    log.info('🔗 Slack Error: Duplicate feedback');
    return new Response('Duplicate', { status: 409 });
  }

  const organization = await database.organization.findFirst({
    where: { id: installation.organizationId },
    select: {
      stripeSubscriptionId: true,
      _count: {
        select: { feedback: true },
      },
    },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  if (
    !organization.stripeSubscriptionId &&
    organization._count.feedback >= MAX_FREE_FEEDBACK
  ) {
    return new Response('Upgrade your subscription to create more feedback', {
      status: 402,
    });
  }

  await database.feedback.create({
    data: {
      organizationId: installation.organizationId,
      content: textToContent(data.message.text),
      title: 'Feedback from Slack',
      source: 'SLACK',
      createdAt: new Date(data.message.ts),
      feedbackUserId,
    },
    select: { id: true },
  });

  return new Response(null, { status: 200 });
};

const handleMessageAction = async (data: MessageActionProperties) => {
  if (data.callback_id === 'create_feedback') {
    return handleCreateFeedback(data);
  }

  log.error('🔗 Slack Error: Invalid Callback ID value', {
    callback_id: data.callback_id,
  });
  return new Response('Bad Request', { status: 400 });
};

export const POST = async (request: NextRequest): Promise<Response> => {
  const text = await request.text();
  const searchParameters = new URLSearchParams(text);

  const payload = searchParameters.get('payload');

  if (!payload) {
    log.error('🔗 Slack Error: No payload');
    return new Response('Bad Request', { status: 400 });
  }

  const data = JSON.parse(payload) as {
    type: string;
    challenge?: string;
  };

  switch (data.type) {
    case 'url_verification': {
      return new Response(data.challenge, { status: 200 });
    }
    case 'message_action': {
      return handleMessageAction(data as MessageActionProperties);
    }
    default: {
      log.error('🔗 Slack Error: Invalid Type value', { type: data.type });
      return new Response('Bad Request', { status: 400 });
    }
  }
};
