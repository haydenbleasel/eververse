'use server';

import { database } from '@/lib/database';
import type { Feedback } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateFeedback = async (
  feedbackId: Feedback['id'],
  data: Omit<Partial<Feedback>, 'content' | 'transcript'> & {
    content?: object;
  }
): Promise<
  | {
      error: string;
    }
  | {
      id: Feedback['id'] | undefined;
    }
> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update feedback");
    }

    // If we're updating the content, we need to reset the feedback analysis data
    if ('content' in data) {
      data.processed = false;
      data.aiSentiment = null;
      data.aiSentimentReason = null;

      await database.feedbackAnalysis.delete({
        where: { feedbackId },
      });
    }

    await database.feedback.update({
      where: { id: feedbackId },
      data,
      select: { id: true },
    });

    revalidatePath(`/feedback/${feedbackId}`);

    const nextFeedback = await database.feedback.findFirst({
      where: { processed: false },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    return { id: nextFeedback?.id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
