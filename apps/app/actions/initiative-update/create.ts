'use server';

import { database } from '@/lib/database';
import type { InitiativeUpdate } from '@prisma/client';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { MAX_FREE_INITIATIVE_UPDATES } from '@repo/lib/consts';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const createInitiativeUpdate = async (
  initiativeId: string,
  data: Pick<InitiativeUpdate, 'title'>
): Promise<{
  id?: string;
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('Not logged in');
    }

    const organization = await database.organization.findFirst({
      where: { id: organizationId },
      select: {
        stripeSubscriptionId: true,
        _count: {
          select: { initiativeUpdates: true },
        },
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    if (
      !organization.stripeSubscriptionId &&
      organization._count.initiativeUpdates >= MAX_FREE_INITIATIVE_UPDATES
    ) {
      throw new Error(
        'You have reached the maximum number of updates for your plan. Please upgrade to post more updates.'
      );
    }

    const update = await database.initiativeUpdate.create({
      data: {
        ...data,
        initiativeId,
        organizationId,
        creatorId: user.id,
        content: {},
      },
      select: { id: true },
    });

    revalidatePath(`/initiatives/${initiativeId}`);

    return { id: update.id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
