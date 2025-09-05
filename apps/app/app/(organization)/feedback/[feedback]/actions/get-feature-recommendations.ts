'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { generateObject } from 'ai';
import { z } from 'zod/v3';

export const getFeatureRecommendations = async (
  text: string
): Promise<
  | {
      data: string[];
    }
  | {
      error: string;
    }
> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        "You don't have permission to get feature recommendations"
      );
    }

    const features = await database.feature.findMany({
      where: {
        organization: {
          stripeSubscriptionId: { not: null },
        },
      },
      select: {
        id: true,
        title: true,
        organizationId: true,
      },
    });

    if (features.length === 0) {
      return { data: [] };
    }

    const { object } = await generateObject({
      model: 'openai/gpt-4o-mini',
      system: [
        'You are an AI that recommends at most 5 related features based a snippet of user feedback provided.',
        'You return an array of IDs of the features you recommend.',
        '------',
        'Here are all the features in the organization:',
        ...features.map(
          (feature) => `{ id: "${feature.id}", title: "${feature.title}" }`
        ),
        '------',
      ].join('\n'),
      prompt: text,
      schema: z.object({
        data: z.array(z.string()),
      }),
    });

    return { data: object.data };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
