'use server';

import { database } from '@/lib/database';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import type { FeatureStatus, PortalStatus } from '@repo/backend/prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const updatePortalStatusMapping = async (
  featureStatusId: FeatureStatus['id'],
  portalStatusId: PortalStatus['id']
): Promise<{
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error('Not logged in');
    }

    const portal = await database.portal.findFirst({
      select: {
        id: true,
      },
    });

    if (!portal) {
      throw new Error('Portal not found');
    }

    const existingMapping = await database.portalStatusMapping.findFirst({
      where: { featureStatusId },
    });

    if (portalStatusId === 'unmapped' && existingMapping) {
      await database.portalStatusMapping.delete({
        where: { id: existingMapping.id },
      });
    } else if (existingMapping) {
      await database.portalStatusMapping.update({
        where: { id: existingMapping.id },
        data: { portalStatusId },
      });
    } else {
      await database.portalStatusMapping.create({
        data: {
          featureStatusId,
          organizationId,
          portalStatusId,
          portalId: portal.id,
        },
      });
    }

    revalidatePath('/settings/portal');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
