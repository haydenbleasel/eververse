import { database } from '@repo/backend/database';
import type {
  FeedbackOrganization,
  FeedbackUser,
} from '@repo/backend/prisma/client';
import { textToContent } from '@repo/editor/lib/tiptap';
import { MAX_FREE_FEEDBACK } from '@repo/lib/consts';
import { getGravatarUrl } from '@repo/lib/gravatar';
import { friendlyWords } from 'friendlier-words';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const FeedbackProperties = z.object({
  title: z.string(),
  text: z.string(),
  user_name: z.string().optional(),
  user_email: z.string().optional(),
  organization_name: z.string().optional(),
  organization_domain: z.string().optional(),
});

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as unknown;
  const parse = FeedbackProperties.safeParse(body);
  const authorization = request.headers.get('Authorization');
  const key = authorization?.split('Bearer ')[1];

  if (!key) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = await database.apiKey.findFirst({
    where: { key },
    select: {
      id: true,
      organizationId: true,
    },
  });

  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!parse.success) {
    return NextResponse.json({ error: parse.error }, { status: 400 });
  }

  let feedbackOrganization: {
    id: FeedbackOrganization['id'];
  } | null = null;

  if (parse.data.organization_domain && parse.data.organization_name) {
    feedbackOrganization = await database.feedbackOrganization.findFirst({
      where: {
        domain: parse.data.organization_domain,
        organizationId: apiKey.organizationId,
      },
      select: { id: true },
    });

    if (!feedbackOrganization) {
      feedbackOrganization = await database.feedbackOrganization.create({
        data: {
          domain: parse.data.organization_domain,
          name: parse.data.organization_name,
          organizationId: apiKey.organizationId,
          source: 'API',
          apiKeyId: apiKey.id,
        },
        select: { id: true },
      });
    }
  }

  let feedbackUser: {
    id: FeedbackUser['id'];
    feedbackOrganizationId: FeedbackUser['feedbackOrganizationId'];
  } | null = null;

  if (parse.data.user_email) {
    feedbackUser = await database.feedbackUser.findFirst({
      where: {
        email: parse.data.user_email,
        organizationId: apiKey.organizationId,
      },
      select: { id: true, feedbackOrganizationId: true },
    });

    if (!feedbackUser) {
      feedbackUser = await database.feedbackUser.create({
        data: {
          email: parse.data.user_email,
          name: parse.data.user_name ?? friendlyWords(2, ' '),
          organizationId: apiKey.organizationId,
          feedbackOrganizationId: feedbackOrganization?.id,
          imageUrl: await getGravatarUrl(parse.data.user_email),
          source: 'API',
          apiKeyId: apiKey.id,
        },
        select: { id: true, feedbackOrganizationId: true },
      });
    } else if (!feedbackUser.feedbackOrganizationId) {
      feedbackUser = await database.feedbackUser.update({
        where: { id: feedbackUser.id },
        data: { feedbackOrganizationId: feedbackOrganization?.id },
        select: { id: true, feedbackOrganizationId: true },
      });
    }
  }

  const organization = await database.organization.findFirst({
    where: { id: apiKey.organizationId },
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
      content: textToContent(parse.data.text),
      organizationId: apiKey.organizationId,
      title: parse.data.title,
      feedbackUserId: feedbackUser ? feedbackUser.id : null,
      source: 'ZAPIER',
      apiKeyId: apiKey.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ success: true });
};
