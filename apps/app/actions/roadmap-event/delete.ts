'use server';

import { database } from '@/lib/database';
import type { RoadmapEvent } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const deleteMarker = async (
  id: RoadmapEvent['id']
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to delete a marker");
    }

    await database.roadmapEvent.delete({
      where: { id },
      select: { id: true },
    });

    revalidatePath('/roadmap');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
