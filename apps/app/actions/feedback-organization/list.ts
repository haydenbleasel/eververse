'use server';

import { database } from '@/lib/database';
import type { FeedbackOrganization } from '@prisma/client';
import { FEEDBACK_PAGE_SIZE } from '@repo/lib/consts';

export type GetFeedbackCompaniesResponse = Pick<
  FeedbackOrganization,
  'createdAt' | 'domain' | 'id' | 'name'
>[];

export const getFeedbackCompanies = async (
  page: number
): Promise<
  | {
      data: GetFeedbackCompaniesResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const data = await database.feedbackOrganization.findMany({
      orderBy: {
        name: 'asc',
      },
      skip: page * FEEDBACK_PAGE_SIZE,
      take: FEEDBACK_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        domain: true,
        createdAt: true,
      },
    });

    return { data };
  } catch (error) {
    return { error };
  }
};
