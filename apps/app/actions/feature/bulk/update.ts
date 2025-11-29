"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import type { Feature } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const updateFeatures = async (
  featureIds: Feature["id"][],
  data: Omit<Partial<Feature>, "content" | "canvas">
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Not logged in");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to update features");
    }

    await database.feature.updateMany({
      where: {
        id: { in: featureIds },
      },
      data,
    });

    revalidatePath("/features");
    revalidatePath("/roadmap");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
