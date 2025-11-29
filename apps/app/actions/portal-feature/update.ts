"use server";
import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import type { PortalFeature } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";
import { getPortalUrl } from "@/lib/portal";

type EditFeaturePortalProperties = {
  title: PortalFeature["title"];
  content: string;
};

export const editFeaturePortal = async (
  portalFeatureId: PortalFeature["id"],
  { title, content }: EditFeaturePortalProperties
): Promise<{
  url?: string;
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Not logged in");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        "You don't have permission to edit features for this organization"
      );
    }

    const portal = await database.portal.findFirst();

    if (!portal) {
      throw new Error("Portal not found");
    }

    const { featureId, id } = await database.portalFeature.update({
      where: { id: portalFeatureId },
      data: {
        title,
        content: JSON.parse(content),
      },
      select: { id: true, featureId: true },
    });

    if (!id) {
      throw new Error("No portal ID returned");
    }

    const url = await getPortalUrl(id);

    revalidatePath(`/features/${featureId}`);

    return { url };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
