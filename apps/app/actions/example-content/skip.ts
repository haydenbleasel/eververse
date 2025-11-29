"use server";

import { currentOrganizationId } from "@repo/backend/auth/utils";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const skipExampleContent = async (): Promise<{
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error("Organization not found");
    }

    await database.organization.update({
      where: { id: organizationId },
      data: {
        onboardingType: "BLANK",
        onboardedAt: new Date(),
      },
    });

    revalidatePath("/welcome");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
