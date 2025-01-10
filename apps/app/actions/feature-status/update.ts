'use server';

import { database } from '@/lib/database';
import type { FeatureStatus } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateStatus = async (
  id: FeatureStatus['id'],
  data: Partial<FeatureStatus>
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update statuses");
    }

    await database.featureStatus.update({
      where: { id },
      data,
      select: { id: true },
    });

    revalidatePath('/settings');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
