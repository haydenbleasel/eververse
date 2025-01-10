'use server';

import { database } from '@/lib/database';
import type { InitiativePage } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';

export const updateInitiativePage = async (
  pageId: InitiativePage['id'],
  data: Omit<Partial<InitiativePage>, 'content'> & {
    content?: object;
  }
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update initiative pages");
    }

    await database.initiativePage.update({
      where: { id: pageId },
      data,
      select: { id: true },
    });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
