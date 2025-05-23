import { database } from '@repo/backend/database';
import type { Prisma, ProductboardImport } from '@repo/backend/prisma/client';
import { createClient } from '@repo/productboard';

type ImportJobProperties = Pick<
  ProductboardImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateNoteTags = async ({
  organizationId,
  token,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });

  const notes = await productboard.GET('/notes', {
    params: {
      header: {
        'X-Version': 1,
      },
    },
  });

  if (notes.error) {
    throw new Error(notes.error.errors?.source?.join(', ') ?? 'Unknown error');
  }

  if (!notes.data) {
    throw new Error('No notes found');
  }

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      feedback: {
        where: { productboardId: { not: null } },
        select: {
          id: true,
          productboardId: true,
          tags: { select: { id: true } },
        },
      },
      tags: { select: { id: true, name: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const filteredFeedback = databaseOrganization.feedback.filter((feedback) => {
    const note = notes.data.data.find(
      ({ id }) => id === feedback.productboardId
    );

    return note?.tags && note.tags.length > 0;
  });

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  for (const feedback of filteredFeedback) {
    const note = notes.data.data.find(
      ({ id }) => id === feedback.productboardId
    );

    if (!note) {
      continue;
    }

    const tagIds = note.tags
      ?.split(',')
      .map(
        (tag) => databaseOrganization.tags.find(({ name }) => name === tag)?.id
      )
      .filter(Boolean) as string[];

    if (!tagIds.length) {
      continue;
    }

    // Check if the feedback already has these exact tags
    const existingTagIds = feedback.tags.map((tag) => tag.id);
    const newTagIds = tagIds.filter((id) => !existingTagIds.includes(id));

    if (!newTagIds.length) {
      continue;
    }

    const transaction = database.feedback.update({
      where: { id: feedback.id },
      data: { tags: { connect: newTagIds.map((id) => ({ id })) } },
      select: { id: true },
    });

    transactions.push(transaction);
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
