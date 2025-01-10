'use server';

import { database } from '@/lib/database';
import type { FeedbackUser } from '@prisma/client';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { getGravatarUrl } from '@repo/lib/gravatar';
import { parseError } from '@repo/lib/parse-error';
import { friendlyWords } from 'friendlier-words';
import { revalidatePath } from 'next/cache';

type CreateFeedbackUserProperties = {
  name?: FeedbackUser['name'];
  email: FeedbackUser['email'];
};

export const createFeedbackUser = async ({
  name = friendlyWords(2, ' '),
  email,
}: CreateFeedbackUserProperties): Promise<{
  id?: FeedbackUser['id'];
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error('Not logged in');
    }

    const existingUser = await database.feedbackUser.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return { id: existingUser.id };
    }

    const { id } = await database.feedbackUser.create({
      data: {
        name,
        email,
        organizationId,
        imageUrl: await getGravatarUrl(email),
      },
      select: {
        id: true,
      },
    });

    revalidatePath('/', 'layout');

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
