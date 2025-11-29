"use server";

import { currentOrganizationId } from "@repo/backend/auth/utils";
import type { Organization } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const updateOrganization = async (
  data: Partial<Organization>
): Promise<{
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error("Not logged in");
    }

    await database.organization.update({
      where: { id: organizationId },
      data,
      select: { id: true },
    });

    revalidatePath("/", "layout");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
