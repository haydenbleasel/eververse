import { database } from '@repo/backend/database';
import type { CannyImport, Prisma } from '@repo/backend/prisma/client';
import { Canny } from '@repo/canny';
import { slugify } from '@repo/lib/slugify';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateTags = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const tags = await canny.tag.list();

  const existingTags = await database.tag.findMany({
    where: { organizationId },
    select: { cannyId: true },
  });

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const newTags = tags.filter((tag) => {
    const existing = existingTags.find(({ cannyId }) => cannyId === tag.id);

    return !existing;
  });

  for (const tag of newTags) {
    const transaction = database.tag.create({
      data: {
        cannyId: tag.id,
        creatorId,
        name: tag.name,
        createdAt: new Date(tag.created),
        organizationId,
        slug: slugify(tag.name),
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
