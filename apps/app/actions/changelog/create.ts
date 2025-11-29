"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { MAX_FREE_CHANGELOGS } from "@repo/lib/consts";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const createChangelog = async (
  title: string
): Promise<{
  id?: string;
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("Not logged in");
    }

    const databaseOrganization = await database.organization.findFirst({
      where: { id: organizationId },
      select: {
        stripeSubscriptionId: true,
        _count: {
          select: { changelog: true },
        },
      },
    });

    if (!databaseOrganization) {
      throw new Error("Organization not found");
    }

    if (
      !databaseOrganization.stripeSubscriptionId &&
      databaseOrganization._count.changelog >= MAX_FREE_CHANGELOGS
    ) {
      throw new Error(
        "You have reached the maximum number of changelog entries for your plan. Please upgrade to post more changelogs."
      );
    }

    const update = await database.changelog.create({
      data: {
        title,
        organizationId,
        creatorId: user.id,
        contributors: {
          create: {
            userId: user.id,
            organizationId,
          },
        },
      },
      select: { id: true },
    });

    revalidatePath("/changelog", "layout");

    return { id: update.id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
