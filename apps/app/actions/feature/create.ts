"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Feature } from "@repo/backend/prisma/client";
import { MAX_FREE_FEATURES } from "@repo/lib/consts";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type CreateFeatureProperties = {
  title: Feature["title"];
  assignee: Feature["ownerId"];
  productId: string | undefined;
  groupId: string | undefined;
};

export const createFeature = async ({
  title,
  assignee,
  productId,
  groupId,
}: CreateFeatureProperties): Promise<
  | {
      error: string;
    }
  | {
      id: Feature["id"];
    }
> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("You must be logged in to create a feature.");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You must be an editor to create a feature.");
    }

    const [defaultStatus, featureCount, organization] = await Promise.all([
      database.featureStatus.findFirst({
        orderBy: { order: "asc" },
        select: { id: true },
      }),
      database.feature.count(),
      database.organization.findUnique({
        where: { id: organizationId },
        select: { stripeSubscriptionId: true },
      }),
    ]);

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!defaultStatus) {
      throw new Error("You must have a feature status to create a feature.");
    }

    if (
      !organization.stripeSubscriptionId &&
      featureCount >= MAX_FREE_FEATURES
    ) {
      throw new Error(
        "You have reached the maximum number of features for your plan. Please upgrade to add more features."
      );
    }

    const { id } = await database.feature.create({
      data: {
        title,
        organizationId,
        creatorId: user.id,
        ownerId: assignee,
        statusId: defaultStatus.id,
        productId,
        groupId,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/features");

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
