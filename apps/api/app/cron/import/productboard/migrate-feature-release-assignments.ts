import { database } from "@repo/backend/database";
import type { Prisma, ProductboardImport } from "@repo/backend/prisma/client";
import { createClient } from "@repo/productboard";

type ImportJobProperties = Pick<
  ProductboardImport,
  "creatorId" | "organizationId" | "token"
>;

export const migrateFeatureReleaseAssignments = async ({
  token,
  organizationId,
}: ImportJobProperties): Promise<number> => {
  const productboard = createClient({ accessToken: token });
  const assignments = await productboard.GET("/feature-release-assignments", {
    params: {
      header: {
        "X-Version": 1,
      },
    },
  });

  if (assignments.error) {
    throw new Error(
      assignments.error.errors.map((error) => error.detail).join(", ")
    );
  }

  if (!assignments.data) {
    throw new Error("No feature release assignments found");
  }

  const databaseOrganization = await database.organization.findUnique({
    where: { id: organizationId },
    select: {
      features: {
        where: { productboardId: { not: null } },
        select: { id: true, productboardId: true, releaseId: true },
      },
      releases: {
        where: { productboardId: { not: null } },
        select: { id: true, productboardId: true },
      },
    },
  });

  if (!databaseOrganization) {
    throw new Error("Could not find organization");
  }

  const transactions: Prisma.PrismaPromise<unknown>[] = [];

  for (const assignment of assignments.data.data) {
    const feature = databaseOrganization.features.find(
      ({ productboardId }) => productboardId === assignment.feature.id
    );

    const release = databaseOrganization.releases.find(
      ({ productboardId }) => productboardId === assignment.release.id
    );

    if (!feature) {
      throw new Error("Could not find feature for assignment");
    }

    if (!release) {
      throw new Error("Could not find release for assignment");
    }

    if (feature.releaseId === release.id) {
      continue;
    }

    const update = database.feature.update({
      where: { id: feature.id },
      data: { releaseId: release.id },
    });

    transactions.push(update);
  }

  await database.$transaction(transactions);

  return transactions.length;
};
