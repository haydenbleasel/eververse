import { getMembers } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { log } from '@repo/observability/log';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateProducts = async ({
  creatorId,
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);

  const [existingProducts, members] = await Promise.all([
    database.product.findMany({
      where: { organizationId },
      select: { productboardId: true },
    }),
    getMembers(organizationId),
  ]);

  const products = await productboard.product.list();
  log.info('⏬ Successfully fetched products from Productboard', {
    count: products.length,
  });

  const promises: Prisma.ProductCreateManyInput[] = products
    .filter((product) => {
      const existing = existingProducts.find(
        ({ productboardId }) => productboardId === product.id
      );

      return !existing;
    })
    .map((product) => {
      const owner = members.find(({ email }) => email === product.owner?.email);

      const data: Prisma.ProductCreateManyInput = {
        name: product.name,
        productboardId: product.id,
        organizationId,
        creatorId,
        ownerId: owner?.id,
        createdAt: new Date(product.createdAt),
      };

      return data;
    });

  const newProducts = await Promise.all(promises);

  await database.product.createMany({
    data: newProducts,
    skipDuplicates: true,
  });

  return newProducts.length;
};
