'use server';

import { database } from '@/lib/database';
import type { Initiative } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateInitiative = async (
  initiativeId: Initiative['id'],
  data: Partial<Initiative>
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update initiatives");
    }

    const initiative = await database.initiative.update({
      where: { id: initiativeId },
      data,
      select: {
        id: true,
        pages: {
          where: {
            default: true,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (data.title && initiative.pages.length > 0) {
      await database.initiativePage.update({
        where: { id: initiative.pages[0].id },
        data: { title: data.title },
        select: { id: true },
      });
    }

    revalidatePath(`/initiatives/${initiativeId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
