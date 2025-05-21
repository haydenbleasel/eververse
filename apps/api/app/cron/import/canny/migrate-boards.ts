import { database } from '@repo/backend/database';
import type { CannyImport, Prisma } from '@repo/backend/prisma/client';
import { Canny } from '@repo/canny';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateBoards = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const boards = await canny.board.list();
  const products = await database.product.findMany({
    where: { organizationId },
    select: { cannyId: true },
  });

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  const newBoards = boards.filter((board) => {
    const existing = products.find(({ cannyId }) => cannyId === board.id);

    return !existing;
  });

  for (const board of newBoards) {
    const transaction = database.product.create({
      data: {
        cannyId: board.id,
        creatorId,
        name: board.name,
        createdAt: new Date(board.created),
        organizationId,
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
