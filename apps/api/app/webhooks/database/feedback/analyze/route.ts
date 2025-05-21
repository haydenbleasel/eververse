import { generateObject } from '@repo/ai';
import { textModel } from '@repo/ai/lib/models';
import { database, getJsonColumnFromTable } from '@repo/backend/database';
import type { Feedback } from '@repo/backend/prisma/client';
import { contentToText } from '@repo/editor/lib/tiptap';
import { z } from 'zod';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: Feedback;
  old_record: null;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as InsertPayload;

  const content = await getJsonColumnFromTable(
    'feedback',
    'content',
    body.record.id
  );

  if (!content) {
    return new Response('Feedback content not found', { status: 404 });
  }

  const { object } = await generateObject({
    model: textModel,
    system: [
      'You are an AI that analyzes user feedback.',
      'You are given a user feedback message by a user.',
      'You are to analyze the feedback into a short summary, pain points, recommendations for the product manager, and desired outcomes for the user.',
      'Do not include any markdown formatting in your response.',
      'Summary should be between 0 and 65535 characters.',
      'Pain points should be between 0 and 65535 characters.',
      'Recommendations should be between 0 and 65535 characters.',
      'Outcomes should be between 0 and 65535 characters.',
    ].join('\n'),
    prompt: contentToText(content),
    schema: z.object({
      summary: z.string(),
      painPoints: z.string(),
      recommendations: z.string(),
      outcomes: z.string(),
    }),
  });

  await database.feedbackAnalysis.create({
    data: {
      summary: object.summary,
      painPoints: object.painPoints,
      recommendations: object.recommendations,
      outcomes: object.outcomes,
      feedbackId: body.record.id,
      organizationId: body.record.organizationId,
    },
    select: { id: true },
  });

  return new Response('Success', { status: 200 });
};
