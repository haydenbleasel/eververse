"use server";

import type { User } from "@repo/backend/auth";
import { EververseRole } from "@repo/backend/auth";
import { currentUser } from "@repo/backend/auth/utils";
import type { Initiative } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type DeleteInitiativeMemberProperties = {
  initiativeId: Initiative["id"];
  userId: User["id"];
};

export const deleteInitiativeMember = async ({
  initiativeId,
  userId,
}: DeleteInitiativeMemberProperties): Promise<{
  error?: string;
}> => {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Not logged in");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to delete members");
    }

    const initiativeMember = await database.initiativeMember.findFirst({
      where: {
        userId,
        initiativeId,
      },
    });

    if (!initiativeMember) {
      throw new Error("Initiative member not found");
    }

    await database.initiativeMember.delete({
      where: { id: initiativeMember.id },
    });

    revalidatePath(`/initiatives/${initiativeId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
