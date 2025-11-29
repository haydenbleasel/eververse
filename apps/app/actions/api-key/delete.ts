"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import type { ApiKey } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const deleteAPIKey = async (
  id: ApiKey["id"]
): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You do not have permission to delete API keys");
    }

    await database.apiKey.delete({
      where: { id },
      select: { id: true },
    });

    revalidatePath("/settings/api");

    return {};
  } catch (error) {
    const message = parseError(error);

    return {
      error: message,
    };
  }
};
