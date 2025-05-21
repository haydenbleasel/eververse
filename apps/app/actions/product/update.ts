'use server';

import { database } from '@/lib/database';
import type { Product } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updateProduct = async (
  id: Product['id'],
  data: Partial<Product>
): Promise<{
  error?: string;
}> => {
  try {
    await database.product.update({
      where: { id },
      data,
      select: { id: true },
    });

    revalidatePath('/features');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
