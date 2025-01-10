'use server';

import { database } from '@/lib/database';
import type { Changelog } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateChangelog = async (
  changelogId: Changelog['id'],
  data: Omit<Partial<Changelog>, 'content'> & {
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
      throw new Error('You do not have permission to update changelogs');
    }

    await database.changelog.update({
      where: { id: changelogId },
      data,
    });

    revalidatePath(`/changelog/${changelogId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
