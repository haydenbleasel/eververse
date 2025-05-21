import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { colors } from '@repo/design-system/lib/colors';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateFeatureStatuses = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const featureStatuses = await productboard.featureStatus.list();

  const existingFeatureStatuses = await database.featureStatus.findMany({
    where: { organizationId },
    select: { productboardId: true, name: true },
  });

  const data: Prisma.FeatureStatusCreateManyInput[] = featureStatuses
    .filter((status) => {
      const existing = existingFeatureStatuses.find(
        (feedback) => feedback.productboardId === status.id
      );

      return !existing;
    })
    .map((status, index) => ({
      name:
        existingFeatureStatuses.find(
          (feedback) => feedback.productboardId === status.id
        )?.name ?? `${status.name} (Productboard)`,
      organizationId,
      complete: status.completed,
      productboardId: status.id,
      color: status.completed ? colors.emerald : undefined,
      order: existingFeatureStatuses.length + index,
    }));

  await database.featureStatus.createMany({
    data,
    skipDuplicates: true,
  });

  return data.length;
};
