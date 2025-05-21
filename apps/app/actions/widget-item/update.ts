'use server';

import { database } from '@/lib/database';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import type { WidgetItem } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type UpdateWidgetItemProperties = Pick<WidgetItem, 'icon' | 'name' | 'link'>;

export const updateWidgetItem = async (
  id: WidgetItem['id'],
  properties: UpdateWidgetItemProperties
): Promise<{
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error('Organization not found');
    }

    const organization = await database.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    if (!organization.stripeSubscriptionId) {
      throw new Error('Upgrade to to add more items');
    }

    await database.widgetItem.update({
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
