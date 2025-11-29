"use server";

import type { User } from "@repo/backend/auth";
import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Changelog } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type AddChangelogContributorProperties = {
  changelogId: Changelog["id"];
  userId: User["id"];
};

export const addChangelogContributor = async ({
  changelogId,
  userId,
}: AddChangelogContributorProperties): Promise<{
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

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You do not have permission to add contributors");
    }

    await database.changelogContributor.create({
      data: {
        userId,
        changelogId,
        organizationId,
      },
    });

    revalidatePath(`/changelog/${changelogId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
