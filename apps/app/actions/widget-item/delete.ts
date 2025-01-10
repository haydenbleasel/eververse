'use server';

import { database } from '@/lib/database';
import type { WidgetItem } from '@prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const deleteWidgetItem = async (
  id: WidgetItem['id']
): Promise<{
  error?: string;
}> => {
  try {
    await database.widgetItem.delete({
      where: { id },
    });

    revalidatePath('/settings/widget');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
