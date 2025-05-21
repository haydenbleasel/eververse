import { database } from '@repo/backend/database';
import type { CannyImport, Prisma } from '@repo/backend/prisma/client';
import { Canny } from '@repo/canny';
import { log } from '@repo/observability/log';
import { tailwind } from '@repo/tailwind-config';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

const getColorForStatus = (status: string): string => {
  switch (status) {
    case 'open': {
      return tailwind.theme.colors.gray[500];
    }
    case 'under review': {
      return tailwind.theme.colors.teal[500];
    }
    case 'planned': {
      return tailwind.theme.colors.blue[500];
    }
    case 'in progress': {
      return tailwind.theme.colors.violet[500];
    }
    case 'complete': {
      return tailwind.theme.colors.emerald[500];
    }
    case 'closed': {
      return tailwind.theme.colors.rose[500];
    }
    default: {
      return tailwind.theme.colors.gray[500];
    }
  }
};

export const migrateStatuses = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const posts = await canny.post.list();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      featureStatuses: { select: { id: true, fromCanny: true, name: true } },
      portals: { select: { id: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Organization not found');
  }

  if (databaseOrganization.portals.length === 0) {
    throw new Error('Organization has no portal');
  }

  const statuses = new Set<string>();

  for (const post of posts) {
    const existingStatus = databaseOrganization.featureStatuses.find(
      (status) => status.fromCanny && status.name === post.status
    );
    if (!existingStatus) {
      statuses.add(post.status);
    }
  }

  if (statuses.size === 0) {
    return 0;
  }

  log.info(`Migrating statuses: ${[...statuses].join(', ')}`);

  await database.featureStatus.createMany({
    data: [...statuses].map((status, index) => {
      const input: Prisma.FeatureStatusCreateManyInput = {
        name: status,
        order: databaseOrganization.featureStatuses.length + index,
        color: getColorForStatus(status),
        organizationId,
        fromCanny: true,
        complete: status === 'complete' || status === 'closed',
      };

      return input;
    }),
    skipDuplicates: true,
  });

  const newStatuses = await database.featureStatus.findMany({
    where: { organizationId, fromCanny: true },
  });

  await database.portalStatus.createMany({
    data: newStatuses.map((status) => {
      const input: Prisma.PortalStatusCreateManyInput = {
        name: status.name,
        order: status.order,
        color: status.color,
        organizationId,
        portalId: databaseOrganization.portals[0].id,
        fromCanny: true,
      };

      return input;
    }),
    skipDuplicates: true,
  });

  const portalStatuses = await database.portalStatus.findMany({
    where: { organizationId, fromCanny: true },
    select: { id: true, name: true, portalId: true },
  });

  await database.portalStatusMapping.createMany({
    data: newStatuses.map((status) => {
      const portalStatus = portalStatuses.find(
        ({ name }) => name === status.name
      );

      if (!portalStatus) {
        throw new Error('Portal status not found');
      }

      const input: Prisma.PortalStatusMappingCreateManyInput = {
        portalStatusId: portalStatus.id,
        featureStatusId: status.id,
        organizationId,
        portalId: portalStatus.portalId,
      };

      return input;
    }),
  });

  return statuses.size;
};
