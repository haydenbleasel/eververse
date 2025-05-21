'use server';

import { database } from '@/lib/database';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type { Changelog } from '@repo/backend/prisma/client';
import { contentToText } from '@repo/editor/lib/tiptap';
import { FEEDBACK_PAGE_SIZE } from '@repo/lib/consts';

export type GetChangelogResponse = (Pick<
  Changelog,
  'id' | 'publishAt' | 'status' | 'title'
> & {
  text: string;
})[];

export const getChangelog = async (
  page: number
): Promise<
  | {
      data: GetChangelogResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const changelogs = await database.changelog.findMany({
      orderBy: { publishAt: 'desc' },
      skip: page * FEEDBACK_PAGE_SIZE,
      take: FEEDBACK_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        publishAt: true,
        status: true,
      },
    });

    const modifiedData = changelogs.map(async (changelog) => {
      const content = await getJsonColumnFromTable(
        'changelog',
        'content',
        changelog.id
      );

      return {
        ...changelog,
        text: content ? contentToText(content) : 'No description provided.',
      };
    });

    const data = await Promise.all(modifiedData);

    return { data };
  } catch (error) {
    return { error };
  }
};
