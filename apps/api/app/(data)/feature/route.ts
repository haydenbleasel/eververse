import { database } from '@repo/backend/database';
import { textToContent } from '@repo/editor/lib/tiptap';
import { MAX_FREE_FEATURES } from '@repo/lib/consts';
import { NextResponse } from 'next/server';
import { z } from 'zod/v3';

const FeatureProperties = z.object({
  title: z.string(),
  text: z.string(),
  custom: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as unknown;
  const parse = FeatureProperties.safeParse(body);
  const authorization = request.headers.get('Authorization');
  const key = authorization?.split('Bearer ')[1];

  if (!key) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = await database.apiKey.findFirst({
    where: { key },
    select: {
      id: true,
      creatorId: true,
      organization: {
        select: {
          id: true,
          stripeSubscriptionId: true,
        },
      },
    },
  });

  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!apiKey.organization.stripeSubscriptionId) {
    return NextResponse.json(
      {
        error:
          'You need to have a subscription to use the API. Please upgrade your plan.',
      },
      { status: 403 }
    );
  }

  if (!parse.success) {
    return NextResponse.json({ error: parse.error }, { status: 400 });
  }

  const organization = await database.organization.findFirst({
    where: { id: apiKey.organization.id },
    select: {
      stripeSubscriptionId: true,
      featureStatuses: {
        orderBy: { order: 'asc' },
        select: { id: true },
        take: 1,
      },
      _count: {
        select: { features: true },
      },
    },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  if (organization.featureStatuses.length === 0) {
    throw new Error('You must have a feature status to create a feature.');
  }

  if (
    !organization.stripeSubscriptionId &&
    organization._count.features >= MAX_FREE_FEATURES
  ) {
    return new Response('Upgrade your subscription to create more features', {
      status: 402,
    });
  }

  await database.feature.create({
    data: {
      creatorId: apiKey.creatorId,
      organizationId: apiKey.organization.id,
      ownerId: apiKey.creatorId,
      title: parse.data.title,
      statusId: organization.featureStatuses[0].id,
      source: 'API',
      apiKeyId: apiKey.id,
      content: textToContent(parse.data.text),
      customFields: parse.data.custom
        ? {
            create: parse.data.custom.map((field) => ({
              customFieldId: field.key,
              value: field.value,
              organizationId: apiKey.organization.id,
            })),
          }
        : undefined,
    },
    select: { id: true },
  });

  return NextResponse.json({ success: true });
};
