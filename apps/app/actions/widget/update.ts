'use server';

import { database } from '@/lib/database';
import type { Widget } from '@prisma/client';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type UpdateWidgetProperties = Partial<Widget>;

export const updateWidget = async (
  id: Widget['id'],
  properties: UpdateWidgetProperties
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('User or organization not found');
    }

    await database.widget.update({
      where: { id },
      data: properties,
    });

    revalidatePath('/settings/widget');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
