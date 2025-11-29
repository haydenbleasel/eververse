"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Feature, Feedback } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const updateFeatureFeedbackConnections = async (
  feedbackId: Feedback["id"],
  features: Feature["id"][]
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("Not logged in");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        "You don't have permission to update feature feedback connections"
      );
    }

    const existingFeatureLinks = await database.feedbackFeatureLink.findMany({
      where: { feedbackId },
      select: { featureId: true },
    });

    // Remove existing links that are not in the new list
    const toRemove = existingFeatureLinks.filter(
      (link) => !features.includes(link.featureId)
    );

    await database.feedbackFeatureLink.deleteMany({
      where: {
        feedbackId,
        featureId: { in: toRemove.map((link) => link.featureId) },
      },
    });

    // Add new links that don't already exist
    const toAdd = features.filter(
      (featureId) =>
        !existingFeatureLinks.some((link) => link.featureId === featureId)
    );

    await database.feedbackFeatureLink.createMany({
      data: toAdd.map((featureId) => ({
        feedbackId,
        featureId,
        organizationId,
        creatorId: user.id,
      })),
    });

    revalidatePath("/features");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
