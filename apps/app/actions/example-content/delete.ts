"use server";

import { currentOrganizationId } from "@repo/backend/auth/utils";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const deleteExampleContent = async (): Promise<{
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error("Organization not found");
    }

    const example = true;

    await database.feedback.deleteMany({
      where: { organizationId, example },
    });

    await database.feedbackOrganization.deleteMany({
      where: { organizationId, example },
    });

    await database.feedbackUser.deleteMany({
      where: { organizationId, example },
    });

    await database.product.deleteMany({
      where: { organizationId, example },
    });

    await database.feature.deleteMany({
      where: { organizationId, example },
    });

    await database.changelog.deleteMany({
      where: { organizationId, example },
    });

    await database.initiative.deleteMany({
      where: { organizationId, example },
    });

    await database.release.deleteMany({
      where: { organizationId, example },
    });

    await database.organization.update({
      where: { id: organizationId },
      data: { onboardedAt: new Date() },
    });

    revalidatePath("/welcome");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
