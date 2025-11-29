import { database } from "@repo/backend/database";
import type { CannyImport, Prisma } from "@repo/backend/prisma/client";
import { Canny } from "@repo/canny";

type ImportJobProperties = Pick<
  CannyImport,
  "creatorId" | "organizationId" | "token"
>;

export const migrateCategories = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const categories = await canny.category.list();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      groups: { select: { cannyId: true } },
      products: { select: { id: true, cannyId: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error("Organization not found");
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const newCategories = categories.filter((category) => {
    const existing = databaseOrganization.groups.find(
      ({ cannyId }) => cannyId === category.id
    );

    return !existing;
  });

  for (const category of newCategories) {
    const product = databaseOrganization.products.find(
      ({ cannyId }) => cannyId === category.board.id
    );

    if (!product) {
      throw new Error("Product not found");
    }

    const transaction = database.group.create({
      data: {
        cannyId: category.id,
        creatorId,
        name: category.name,
        createdAt: new Date(category.created),
        organizationId,
        productId: product.id,
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
