'use server';

import { database } from '@/lib/database';
import { getPortalUrl } from '@/lib/portal';
import type { PortalFeature } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type AddFeatureToPortalProperties = {
  title: PortalFeature['title'];
  content: string;
};

export const addFeatureToPortal = async (
  featureId: PortalFeature['id'],
  { title, content }: AddFeatureToPortalProperties
): Promise<{
  url?: string;
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        "You don't have permission to add features to the portal"
      );
    }

    const portal = await database.portal.findFirst();

    if (!portal) {
      throw new Error('Portal not found');
    }

    const { id } = await database.portalFeature.create({
      data: {
        title,
        content: JSON.parse(content),
        featureId,
        organizationId,
        portalId: portal.id,
        creatorId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!id) {
      throw new Error('No portal ID returned');
    }

    const url = await getPortalUrl(id);

    revalidatePath(`/features/${featureId}`);

    return { url };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
