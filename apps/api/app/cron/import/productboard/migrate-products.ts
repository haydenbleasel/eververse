import { getMembers } from "@repo/backend/auth/utils";
import { database } from "@repo/backend/database";
import type { Prisma, ProductboardImport } from "@repo/backend/prisma/client";
import { log } from "@repo/observability/log";
import { createClient } from "@repo/productboard";

type ImportJobProperties = Pick<
  ProductboardImport,
  "creatorId" | "organizationId" | "token"
>;

export const migrateProducts = async ({
  creatorId,
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });

  const [existingProducts, members] = await Promise.all([
    database.product.findMany({
      where: { organizationId },
      select: { productboardId: true },
    }),
    getMembers(organizationId),
  ]);

  const products = await productboard.GET("/products", {
    params: {
      header: {
        "X-Version": 1,
      },
    },
  });

  if (products.error) {
    throw new Error(
      products.error.errors.map((error) => error.detail).join(", ")
    );
  }

  if (!products.data) {
    throw new Error("No products found");
  }

  log.info("⏬ Successfully fetched products from Productboard", {
    count: products.data.data.length,
  });

  const promises: Prisma.ProductCreateManyInput[] = products.data.data
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
