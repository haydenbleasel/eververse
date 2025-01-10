import type { CannyImport, Prisma } from '@prisma/client';
import { database } from '@repo/backend/database';
import { Canny } from '@repo/canny';
import { textToContent } from '@repo/editor/lib/tiptap';

type ImportJobProperties = Pick<
  CannyImport,
  'creatorId' | 'organizationId' | 'token'
>;

export const migrateComments = async ({
  token,
  organizationId,
  creatorId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const comments = await canny.comment.list();
  const statusChanges = await canny.statusChange.list();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      features: { select: { cannyId: true, id: true } },
      feedback: { select: { cannyId: true } },
      feedbackUsers: { select: { cannyId: true, id: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error('Could not find organization');
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const newComments = comments.filter((comment) => {
    const existing = databaseOrganization.feedback.find(
      ({ cannyId }) => cannyId === comment.id
    );

    const isStatusChangeComment = statusChanges.some(
      (statusChange) => statusChange.changeComment.value === comment.value
    );

    return !existing && !isStatusChangeComment;
  });

  for (const comment of newComments) {
    const linkedFeature = databaseOrganization.features.find(
      ({ cannyId }) => comment.post.id === cannyId
    );

    const transaction = database.feedback.create({
      data: {
        content: textToContent(comment.value),
        title: `Comment on ${comment.post.title}`,
        organizationId,
        cannyId: comment.id,
        createdAt: new Date(comment.created),
        feedbackUserId: databaseOrganization.feedbackUsers.find(
          ({ cannyId }) => cannyId === comment.author.id
        )?.id,
        features: linkedFeature
          ? {
              create: [
                {
                  featureId: linkedFeature.id,
                  organizationId,
                  creatorId,
                },
              ],
            }
          : undefined,
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
