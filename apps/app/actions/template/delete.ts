'use server';

import { database } from '@/lib/database';
import type { Template } from '@prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const deleteTemplate = async (
  id: Template['id']
): Promise<{
  error?: string;
}> => {
  try {
    await database.template.delete({
      where: { id },
    });

    revalidatePath('/settings/templates');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
