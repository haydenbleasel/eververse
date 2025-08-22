import { database, getJsonColumnFromTable } from '@repo/backend/database';
import type { Feature } from '@repo/backend/prisma/client';
import { contentToText } from '@repo/editor/lib/tiptap';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: Feature;
  old_record: null;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as InsertPayload;

  const organization = await database.organization.findUnique({
    where: { id: body.record.organizationId },
    select: { productDescription: true },
  });

  if (!organization) {
    return new Response('Organization not found', { status: 404 });
  }

  const { productDescription } = organization;

  const content = await getJsonColumnFromTable(
    'feature',
    'content',
    body.record.id
  );

  if (!content) {
    return new Response('No content to determine RICE score.', { status: 401 });
  }

  const { object } = await generateObject({
    model: 'openai/gpt-4o-mini',
    system: [
      'You are an AI that determines the RICE score of a new product feature, where:',
      '- Reach is the number of people who will be affected by the feature. This can be between 0 and 100.',
      '- Impact is the impact the feature will have on the users. This can be 1 (minimal), 2 (low), 3 (medium), 4 (high), or 5 (massive).',
      '- Confidence is the level of confidence in your estimates. This can be between 0 (0%) and 100 (100%).',
      '- Effort is the level of effort required to build and ship the feature. This can be between 0 (0%) and 10 (100%).',
      'You are given a new feature idea and asked to determine the RICE score.',
      'You may also be given a product description to help you.',
    ].join('\n'),
    prompt: [
      `Feature name: ${body.record.title}`,
      '------',
      'Feature description:',
      content ? contentToText(content) : 'None provided.',
      '------',
      'Product description:',
      productDescription ?? 'None provided.',
    ].join('\n'),
    schema: z.object({
      reach: z.object({
        score: z.number(),
        reason: z.string(),
      }),
      impact: z.object({
        score: z.number(),
        reason: z.string(),
      }),
      confidence: z.object({
        score: z.number(),
        reason: z.string(),
      }),
      effort: z.object({
        score: z.number(),
        reason: z.string(),
      }),
    }),
  });

  await database.feature.update({
    where: {
      id: body.record.id,
    },
    data: {
      aiRice: {
        create: {
          reach: object.reach.score,
          impact: object.impact.score,
          confidence: object.confidence.score,
          effort: object.effort.score,
          reachReason: object.reach.reason,
          impactReason: object.impact.reason,
          confidenceReason: object.confidence.reason,
          effortReason: object.effort.reason,
          organizationId: body.record.organizationId,
        },
      },
    },
    select: { id: true },
  });

  return new Response('Success', { status: 200 });
};
