import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateCustomFields = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const customFields = await productboard.customField.list();

  const existingCustomFields = await database.featureCustomField.findMany({
    where: { organizationId },
    select: { productboardId: true },
  });

  const newCustomFields = customFields.filter((status) => {
    const existing = existingCustomFields.find(
      (field) => field.productboardId === status.id
    );

    return !existing;
  });

  const data: Prisma.FeatureCustomFieldCreateManyInput[] = newCustomFields.map(
    (customField) => ({
      name: customField.name,
      organizationId,
      description: customField.description,
      productboardId: customField.id,
    })
  );

  await database.featureCustomField.createMany({
    data,
    skipDuplicates: true,
  });

  return newCustomFields.length;
};
