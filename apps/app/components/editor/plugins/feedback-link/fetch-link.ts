'use server';

import { database } from '@/lib/database';
import type { Feedback, FeedbackUser } from '@prisma/client';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { contentToText } from '@repo/editor/lib/tiptap';
import { parseError } from '@repo/lib/parse-error';

export type FetchLinkResponse = Pick<
  Feedback,
  'aiSentiment' | 'createdAt' | 'id' | 'title'
> & {
  readonly text: string;
  readonly feedbackUser: Pick<
    FeedbackUser,
    'email' | 'imageUrl' | 'name'
  > | null;
};

export const fetchLink = async (
  id: Feedback['id']
): Promise<{
  error?: string;
  data?: FetchLinkResponse;
}> => {
  try {
    const feedback = await database.feedback.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        feedbackUser: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        aiSentiment: true,
      },
    });

    if (!feedback) {
      throw new Error('Feedback not found');
    }

    const content = await getJsonColumnFromTable(
      'feedback',
      'content',
      feedback.id
    );

    const data = {
      ...feedback,
      text: content ? contentToText(content) : '',
    };

    return { data };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
