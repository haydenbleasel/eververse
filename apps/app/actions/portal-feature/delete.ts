"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import type { PortalFeature } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const removeFeaturePortal = async (
  portalFeatureId: PortalFeature["id"]
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Not logged in");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        "You don't have permission to remove features from the portal"
      );
    }

    const portal = await database.portal.findFirst();

    if (!portal) {
      throw new Error("Portal not found");
    }

    const { featureId } = await database.portalFeature.delete({
      where: { id: portalFeatureId },
      select: { featureId: true },
    });

    revalidatePath(`/features/${featureId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
