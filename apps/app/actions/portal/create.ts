'use server';

import { database } from '@/lib/database';
import type { Prisma } from '@prisma/client';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { parseError } from '@repo/lib/parse-error';
import { tailwind } from '@repo/tailwind-config';
import { friendlyWords } from 'friendlier-words';
import { revalidatePath } from 'next/cache';

const reservedSlugs = ['app', 'docs', 'api', 'widget', 'api-dev'];

export const createPortal = async (): Promise<{
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error('Not logged in');
    }

    const [organization, featureStatuses] = await Promise.all([
      database.organization.findUnique({
        where: { id: organizationId },
      }),
      database.featureStatus.findMany(),
    ]);

    if (!organization) {
      throw new Error('Organization not found');
    }

    let slug = organization.slug;

    if (!slug || reservedSlugs.includes(slug)) {
      slug = friendlyWords();
    }

    const { id: portalId, statuses } = await database.portal.create({
      data: {
        name: organization.name,
        slug,
        organizationId,
        statuses: {
          createMany: {
            data: [
              {
                name: 'Backlog',
                order: 0,
                color: tailwind.theme.colors.gray[500],
                organizationId: organization.id,
              },
              {
                name: 'In Progress',
                order: 1,
                color: tailwind.theme.colors.yellow[500],
                organizationId: organization.id,
              },
              {
                name: 'Shipped',
                order: 2,
                color: tailwind.theme.colors.green[500],
                organizationId: organization.id,
              },
            ],
          },
        },
      },
      select: {
        id: true,
        statuses: {
          select: {
            id: true,
            order: true,
          },
        },
      },
    });

    // Backlog statuses is an array containing the first status that is not complete
    const backlogStatusMappings: Prisma.PortalStatusMappingCreateManyInput[] =
      featureStatuses
        .sort((statusA, statusB) => statusA.order - statusB.order)
        .filter((featureStatus) => !featureStatus.complete)
        .slice(0, 1)
        .map((featureStatus) => ({
          featureStatusId: featureStatus.id,
          organizationId: organization.id,
          portalId,
          portalStatusId: statuses[0].id,
        }));

    // Shipped status is everything that is complete, but not backlogStatus
    const shippedStatusMappings: Prisma.PortalStatusMappingCreateManyInput[] =
      featureStatuses
        .filter((featureStatus) => featureStatus.complete)
        .filter(
          (featureStatus) =>
            !backlogStatusMappings
              .map((mapping) => mapping.featureStatusId)
              .includes(featureStatus.id)
        )
        .map((featureStatus) => ({
          featureStatusId: featureStatus.id,
          organizationId: organization.id,
          portalId,
          portalStatusId: statuses[2].id,
        }));

    // In progress statuses are everything that is not backlogStatus and not shippedStatuses
    const inProgressStatusMappings: Prisma.PortalStatusMappingCreateManyInput[] =
      featureStatuses
        .filter(
          (featureStatus) =>
            !backlogStatusMappings
              .map((mapping) => mapping.featureStatusId)
              .includes(featureStatus.id)
        )
        .filter(
          (featureStatus) =>
            !shippedStatusMappings
              .map((mapping) => mapping.featureStatusId)
              .includes(featureStatus.id)
        )
        .map((featureStatus) => ({
          featureStatusId: featureStatus.id,
          organizationId: organization.id,
          portalId,
          portalStatusId: statuses[1].id,
        }));

    await database.portalStatusMapping.createMany({
      data: [
        ...backlogStatusMappings,
        ...inProgressStatusMappings,
        ...shippedStatusMappings,
      ],
    });

    revalidatePath('/settings/portal');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
