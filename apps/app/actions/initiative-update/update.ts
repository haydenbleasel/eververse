'use server';

import { database } from '@/lib/database';
import type { InitiativeUpdate } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateInitiativeUpdate = async (
  initiativeUpdateId: InitiativeUpdate['id'],
  data: Omit<Partial<InitiativeUpdate>, 'content'> & {
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
      throw new Error(
        'You do not have permission to update initiative updates'
      );
    }

    const initiativeUpdate = await database.initiativeUpdate.update({
      where: { id: initiativeUpdateId },
      data,
      select: {
        id: true,
        initiativeId: true,
      },
    });

    revalidatePath(
      `/initiative/${initiativeUpdate.initiativeId}/updates/${initiativeUpdateId}`
    );

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
