'use server';

import { database } from '@/lib/database';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import type { Feature } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const deleteFeature = async (
  id: Feature['id']
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error('You do not have permission to delete features');
    }

    await database.feature.delete({
      where: { id },
      select: { id: true },
    });

    revalidatePath('/features');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
