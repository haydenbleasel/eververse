'use server';

import { database } from '@/lib/database';
import type { FeedbackUser } from '@prisma/client';
import { FEEDBACK_PAGE_SIZE } from '@repo/lib/consts';

export type GetFeedbackUsersResponse = Pick<
  FeedbackUser,
  'createdAt' | 'email' | 'id' | 'imageUrl' | 'name'
>[];

export const getFeedbackUsers = async (
  page: number
): Promise<
  | {
      data: GetFeedbackUsersResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const data = await database.feedbackUser.findMany({
      orderBy: {
        name: 'asc',
      },
      skip: page * FEEDBACK_PAGE_SIZE,
      take: FEEDBACK_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        email: true,
        createdAt: true,
      },
    });

    return { data };
  } catch (error) {
    return { error };
  }
};
