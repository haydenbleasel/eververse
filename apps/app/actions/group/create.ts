'use server';

import { database } from '@/lib/database';
import type { Group } from '@prisma/client';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type CreateGroupProperties = {
  name: Group['name'];
  productId: string | undefined;
  parentGroupId: string | undefined;
};

export const createGroup = async ({
  name,
  productId,
  parentGroupId,
}: CreateGroupProperties): Promise<{
  id?: Group['id'];
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('You must be logged in to create a group.');
    }

    if (!user.email) {
      throw new Error('You must have an email to create a group.');
    }

    if (!user.email_confirmed_at) {
      throw new Error('You must have a verified email to create a group.');
    }

    const { id } = await database.group.create({
      data: {
        name,
        creatorId: user.id,
        organizationId,
        productId,
        parentGroupId,
      },
      select: {
        id: true,
      },
    });

    revalidatePath('/features');

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
