'use server';

import { database } from '@/lib/database';
import type { FeedbackOrganization, FeedbackUser } from '@prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type AddOrganizationToUserProperties = {
  feedbackUser: FeedbackUser['id'];
  feedbackOrganization: FeedbackOrganization['id'];
};

export const addOrganizationToUser = async ({
  feedbackUser,
  feedbackOrganization,
}: AddOrganizationToUserProperties): Promise<{
  error?: string;
}> => {
  try {
    await database.feedbackUser.update({
      where: { id: feedbackUser },
      data: { feedbackOrganizationId: feedbackOrganization },
      select: { id: true },
    });

    revalidatePath('/feedback');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
