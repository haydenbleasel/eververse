"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import type { InitiativeCanvas } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { database } from "@/lib/database";

export const updateInitiativeCanvas = async (
  initiativeCanvasId: InitiativeCanvas["id"],
  data: Omit<Partial<InitiativeCanvas>, "content"> & {
    content?: object;
  }
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Organization not found");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        "You don't have permission to update initiative canvases"
      );
    }

    await database.initiativeCanvas.update({
      where: { id: initiativeCanvasId },
      data,
    });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
