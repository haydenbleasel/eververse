import type { Prisma, ProductboardImport } from '@prisma/client';
import { database } from '@repo/backend/database';
import { Productboard } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateNoteConnections = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const productboard = new Productboard(token);
  const notes = await productboard.note.list();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      feedback: {
        where: { productboardId: { not: null } },
        select: { id: true, productboardId: true },
      },
      features: {
        where: { productboardId: { not: null } },
        select: {
          id: true,
          productboardId: true,
          feedback: {
            select: {
              feedbackId: true,
            },
          },
        },
      },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  for (const feedback of databaseOrganization.feedback) {
    const originalNote = notes.find(({ id }) => id === feedback.productboardId);

    if (!originalNote) {
      continue;
    }

    const noteLinkedFeatures = originalNote.features.map(({ id }) => id);

    if (!noteLinkedFeatures.length) {
      continue;
    }

    for (const feature of databaseOrganization.features) {
      if (
        feature.productboardId &&
        noteLinkedFeatures.includes(feature.productboardId) &&
        !feature.feedback.some(
          (connection) => connection.feedbackId === feedback.id
        )
      ) {
        const transaction = database.feedbackFeatureLink.create({
          data: {
            creatorId,
            feedbackId: feedback.id,
            featureId: feature.id,
            organizationId,
            createdAt: originalNote.createdAt,
          },
        });

        transactions.push(transaction);
      }
    }
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
