'use server';

import { database } from '@/lib/database';
import type { Product } from '@prisma/client';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const createProduct = async (
  name: Product['name']
): Promise<{
  id?: Product['id'];
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('You must be logged in to create a product.');
    }

    const { id } = await database.product.create({
      data: {
        name,
        creatorId: user.id,
        organizationId,
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
