'use server';

import { database } from '@/lib/database';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type { Feedback, FeedbackUser } from '@repo/backend/prisma/client';
import { contentToText } from '@repo/editor/lib/tiptap';
import { FEEDBACK_PAGE_SIZE } from '@repo/lib/consts';

export type GetFeedbackResponse = (Pick<
  Feedback,
  'aiSentiment' | 'createdAt' | 'id' | 'title'
> & {
  readonly text: string;
  readonly feedbackUser: Pick<
    FeedbackUser,
    'email' | 'imageUrl' | 'name'
  > | null;
})[];

export const getFeedback = async (
  page: number,
  showProcessed: boolean
): Promise<
  | {
      data: GetFeedbackResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const feedbacks = await database.feedback.findMany({
      where: {
        processed: showProcessed ? undefined : false,
      },
      orderBy: { createdAt: 'desc' },
      skip: page * FEEDBACK_PAGE_SIZE,
      take: FEEDBACK_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        createdAt: true,
        audioUrl: true,
        videoUrl: true,
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

    const promises = feedbacks.map(
      async ({ audioUrl, videoUrl, ...feedback }) => {
        const content = await getJsonColumnFromTable(
          'feedback',
          'content',
          feedback.id
        );
        let text = content ? contentToText(content) : 'No content.';

        if (audioUrl) {
          text = 'Audio feedback';
        } else if (videoUrl) {
          text = 'Video feedback';
        }

        return {
          ...feedback,
          text,
        };
      }
    );

    const data = await Promise.all(promises);

    return { data };
  } catch (error) {
    return { error };
  }
};
