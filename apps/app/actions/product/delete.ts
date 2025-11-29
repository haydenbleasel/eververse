"use server";

import type { Product } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const deleteProduct = async (
  id: Product["id"]
): Promise<{
  error?: string;
}> => {
  try {
    await database.product.delete({
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
