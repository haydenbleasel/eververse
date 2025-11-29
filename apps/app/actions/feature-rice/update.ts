"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Feature, FeatureRice } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type UpdateRiceProperties = {
  featureId: Feature["id"];
  reach: FeatureRice["reach"] | undefined;
  impact: FeatureRice["impact"] | undefined;
  confidence: FeatureRice["confidence"] | undefined;
  effort: FeatureRice["effort"] | undefined;
};

export const updateRice = async ({
  featureId,
  reach = 1,
  impact = 1,
  confidence = 1,
  effort = 1,
}: UpdateRiceProperties): Promise<{
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
      throw new Error("You don't have permission to update RICE");
    }

    await database.featureRice.upsert({
      where: { featureId },
      create: {
        featureId,
        reach,
        impact,
        confidence,
        effort,
        organizationId,
      },
      update: {
        reach,
        impact,
        confidence,
        effort,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/features");
    revalidatePath(`/features/${featureId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
