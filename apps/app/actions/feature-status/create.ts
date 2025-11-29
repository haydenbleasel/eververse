"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { FeatureStatus } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const createStatus = async (
  name: FeatureStatus["name"],
  color: FeatureStatus["color"],
  complete: FeatureStatus["complete"]
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

    const databaseOrganization = await database.organization.findUnique({
      where: { id: organizationId },
      select: { stripeSubscriptionId: true },
    });

    if (!databaseOrganization) {
      throw new Error("Organization not found");
    }

    if (!databaseOrganization.stripeSubscriptionId) {
      throw new Error("Please upgrade to create custom feature statuses.");
    }

    const highestOrder = await database.featureStatus.findFirst({
      where: { organizationId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const order = highestOrder ? highestOrder.order + 1 : 0;

    await database.featureStatus.create({
      data: {
        name,
        color,
        complete,
        order,
        organizationId,
      },
      select: { id: true },
    });

    revalidatePath("/settings/statuses");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
