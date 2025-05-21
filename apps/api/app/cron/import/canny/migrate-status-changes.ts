import { getMembers } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import type { CannyImport, Prisma } from '@repo/backend/prisma/client';
import { Canny } from '@repo/canny';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateStatusChanges = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const statusChanges = await canny.statusChange.list();
  const members = await getMembers(organizationId);

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      portalFeatureStatusChanges: { select: { cannyId: true } },
      portalFeatures: {
        select: {
          id: true,
          cannyId: true,
          feature: { select: { cannyId: true } },
        },
      },
      portalStatuses: { select: { id: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Organization not found');
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const newStatusChanges = statusChanges.filter((statusChange) => {
    const existing = databaseOrganization.portalFeatureStatusChanges.find(
      ({ cannyId }) => cannyId === statusChange.id
    );

    return !existing;
  });

  for (const statusChange of newStatusChanges) {
    const portalFeature = databaseOrganization.portalFeatures.find(
      ({ feature }) => feature.cannyId === statusChange.post.id
    );

    if (!portalFeature) {
      throw new Error('Portal feature not found');
    }

    const transaction = database.portalFeatureStatusChange.create({
      data: {
        cannyId: statusChange.id,
        comment: statusChange.changeComment.value,
        createdAt: new Date(statusChange.created),
        organizationId,
        portalFeatureId: portalFeature.id,

        // need to migrate statuses
        portalStatusId: databaseOrganization.portalStatuses[0].id,

        userId:
          members.find(({ email }) => email === statusChange.changer.email)
            ?.id ?? creatorId,
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
