"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import type { Initiative, InitiativeUpdate } from "@repo/backend/prisma/client";
import { textToContent } from "@repo/editor/lib/tiptap";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const createInitiativeUpdateContent = async (
  initiativeId: Initiative["id"],
  initiativeUpdateId: InitiativeUpdate["id"]
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Not logged in");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You do not have permission to create update versions");
    }

    const update = await database.initiativeUpdate.update({
      where: {
        id: initiativeUpdateId,
        initiativeId,
      },
      data: {
        content: textToContent(""),
      },
      select: {
        id: true,
        initiativeId: true,
      },
    });

    revalidatePath(`/initiative/${update.initiativeId}/updates/${update.id}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
