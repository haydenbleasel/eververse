import { database } from "@repo/backend/database";
import type { CannyImport, Prisma } from "@repo/backend/prisma/client";
import { Canny } from "@repo/canny";

type ImportJobProperties = Pick<
  CannyImport,
  "creatorId" | "organizationId" | "token"
>;

export const migrateVotes = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const canny = new Canny(token);
  const votes = await canny.vote.list();

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      feedbackUsers: { select: { email: true, id: true } },
      portals: { select: { id: true } },
      portalFeatures: {
        select: {
          cannyId: true,
          id: true,
          feature: { select: { cannyId: true } },
        },
      },
      portalFeatureVotes: { select: { cannyId: true, id: true } },
    },
  });

  if (!databaseOrganization) {
    throw new Error("Could not find organization");
  }

  if (databaseOrganization.portals.length === 0) {
    throw new Error("Organization does not have a portal");
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];
  const newVotes = votes.filter((vote) => {
    const existing = databaseOrganization.portalFeatureVotes.find(
      ({ cannyId }) => cannyId === vote.id
    );

    return !existing;
  });

  for (const vote of newVotes) {
    const feedbackUser = databaseOrganization.feedbackUsers.find(
      ({ email }) => email === vote.voter.email
    );

    if (!feedbackUser) {
      throw new Error("Could not find feedback user");
    }

    const portalFeature = databaseOrganization.portalFeatures.find(
      ({ feature }) => feature.cannyId === vote.post.id
    );

    if (!portalFeature) {
      throw new Error("Could not find portal feature");
    }

    const transaction = database.portalFeatureVote.create({
      data: {
        cannyId: vote.id,
        createdAt: new Date(vote.created),
        feedbackUserId: feedbackUser.id,
        portalId: databaseOrganization.portals[0].id,
        organizationId,
        portalFeatureId: portalFeature.id,
      },
    });

    transactions.push(transaction);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
