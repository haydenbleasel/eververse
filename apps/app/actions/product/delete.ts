'use server';

import { database } from '@/lib/database';
import type { Product } from '@prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const deleteProduct = async (
  id: Product['id']
): Promise<{
  error?: string;
}> => {
  try {
    await database.product.delete({
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
