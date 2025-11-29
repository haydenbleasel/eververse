"use server";

import type { FeatureStatus, Prisma } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const updateFeatureStatuses = async (
  ids: FeatureStatus["id"][]
): Promise<{
  error?: string;
}> => {
  try {
    const promises: Prisma.PrismaPromise<unknown>[] = [];

    for (const [index, id] of ids.entries()) {
      promises.push(
        database.featureStatus.update({
          where: { id },
          data: { order: index },
          select: { id: true },
        })
      );
    }

    await database.$transaction(promises);

    revalidatePath("/settings");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
