import { env } from '@/env';
import { database } from '@/lib/database';
import type { PortalFeature } from '@prisma/client';
import { currentOrganizationId } from '@repo/backend/auth/utils';

export const getPortalUrl = async (
  portalId?: PortalFeature['id']
): Promise<string> => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    throw new Error('Not logged in');
  }

  const portal = await database.portal.findFirst({
    where: { organizationId },
    select: { slug: true },
  });

  if (!portal) {
    throw new Error('No portal found');
  }

  const portalUrl = new URL(portalId ?? '/', env.EVERVERSE_PORTAL_URL);
  portalUrl.hostname = [portal.slug, portalUrl.hostname].join('.');

  return portalUrl.toString();
};
