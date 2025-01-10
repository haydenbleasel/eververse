'use server';

import { database } from '@/lib/database';
import type { Initiative, InitiativeFile } from '@prisma/client';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type CreateInitiativeFileProperties = {
  initiativeId: Initiative['id'];
  data: {
    name: string;
    url: string;
  };
};

export const createInitiativeFile = async ({
  initiativeId,
  data,
}: CreateInitiativeFileProperties): Promise<{
  id?: InitiativeFile['id'];
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('You must be logged in to create a file.');
    }

    const { id } = await database.initiativeFile.create({
      data: {
        name: data.name,
        url: data.url,
        creatorId: user.id,
        organizationId,
        initiativeId,
      },
      select: {
        id: true,
      },
    });

    revalidatePath(`/initiatives/${initiativeId}`);

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
