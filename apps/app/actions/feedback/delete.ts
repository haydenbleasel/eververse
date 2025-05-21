'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import type { Feedback } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const deleteFeedback = async (
  feedbackId: Feedback['id']
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to delete feedback");
    }

    await database.feedback.delete({
      where: { id: feedbackId },
      select: { id: true },
    });

    revalidatePath('/feedback');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
