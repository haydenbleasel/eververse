import type { Prisma, ProductboardImport } from '@prisma/client';
import { database } from '@repo/backend/database';
import { markdownToContent } from '@repo/editor/lib/tiptap';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateNotes = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const notes = await productboard.note.list();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      feedback: { select: { id: true, productboardId: true } },
      feedbackUsers: { select: { id: true, productboardId: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  const promises: Promise<Prisma.FeedbackCreateArgs['data']>[] = notes
    .filter((note) => {
      const existing = databaseOrganization.feedback.find(
        (feedback) => feedback.productboardId === note.id
      );

      return !existing;
    })
    .map(async (note) => {
      const feedbackUserId = databaseOrganization.feedbackUsers.find(
        (feedbackUser) => feedbackUser.productboardId === note.user?.id
      )?.id;

      const input: Prisma.FeedbackCreateArgs['data'] = {
        content: note.content ? await markdownToContent(note.content) : {},
        organizationId,
        title: note.title,
        createdAt: note.createdAt ? new Date(note.createdAt) : undefined,
        productboardId: note.id,
        feedbackUserId,
        processed: note.state === 'processed',
      };

      return input;
    });

  const data = await Promise.all(promises);

  for (const input of data) {
    transactions.push(
      database.feedback.create({
        data: input,
      })
    );
  }

  // Each bucket should have 50 transactions max
  const bucketCount = Math.ceil(transactions.length / 50);

  const buckets: Prisma.PrismaPromise<unknown>[][] = Array.from({
    length: bucketCount,
  })
    .fill(0)
    .map(() => []);

  for (const [index, transaction] of transactions.entries()) {
    const bucket = index % bucketCount;

    buckets[bucket].push(transaction);
  }

  // Run database transactions sequentially to avoid deadlocks
  for (const bucket of buckets) {
    await database.$transaction(bucket);
  }

  return transactions.length;
};
