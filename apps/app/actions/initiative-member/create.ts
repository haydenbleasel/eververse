"use server";

import type { User } from "@repo/backend/auth";
import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Initiative } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type AddInitiativeMemberProperties = {
  initiativeId: Initiative["id"];
  userId: User["id"];
};

export const addInitiativeMember = async ({
  initiativeId,
  userId,
}: AddInitiativeMemberProperties): Promise<{
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
      throw new Error("You don't have permission to add members");
    }

    await database.initiativeMember.create({
      data: {
        userId,
        initiativeId,
        organizationId,
        creatorId: user.id,
      },
    });

    revalidatePath(`/initiatives/${initiativeId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
