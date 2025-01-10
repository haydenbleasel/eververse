'use server';

import { database } from '@/lib/database';
import type { FeatureConnection } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const disconnectFeature = async (
  connectionId: FeatureConnection['id']
): Promise<{
  error?: string;
}> => {
  const user = await currentUser();

  if (!user) {
    throw new Error('Not logged in');
  }

  if (user.user_metadata.organization_role === EververseRole.Member) {
    throw new Error(
      "You don't have permission to disconnect feature connections"
    );
  }

  try {
    await database.featureConnection.delete({
      where: { id: connectionId },
    });

    revalidatePath('/features', 'layout');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};