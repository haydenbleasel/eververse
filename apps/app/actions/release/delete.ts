'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import type { Release } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const deleteRelease = async (
  id: Release['id']
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to delete a release");
    }

    await database.release.delete({
      where: { id },
      select: { id: true },
    });

    revalidatePath('/releases');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
