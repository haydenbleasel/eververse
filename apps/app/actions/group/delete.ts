"use server";

import type { Group } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const deleteGroup = async (
  id: Group["id"]
): Promise<{
  error?: string;
}> => {
  try {
    await database.group.delete({
      where: { id },
      select: { id: true },
    });

    revalidatePath("/features");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
