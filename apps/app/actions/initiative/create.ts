"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { textToContent } from "@repo/editor/lib/tiptap";
import { MAX_FREE_INITIATIVES } from "@repo/lib/consts";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const createInitiative = async (
  title: string,
  emoji: string,
  ownerId: string
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
      throw new Error("You must be logged in to create an initiative.");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to create an initiative.");
    }

    const organization = await database.organization.findUnique({
      where: { id: organizationId },
      select: {
        stripeSubscriptionId: true,
        _count: {
          select: {
            initiatives: true,
          },
        },
      },
    });

    if (!organization) {
      throw new Error("Organization not found.");
    }

    if (
      !organization.stripeSubscriptionId &&
      organization._count.initiatives >= MAX_FREE_INITIATIVES
    ) {
      throw new Error(
        "You have reached the maximum number of initiatives for your plan. Please upgrade to add more initiatives."
      );
    }

    const { id } = await database.initiative.create({
      data: {
        title,
        creatorId: user.id,
        organizationId,
        ownerId,
        emoji,
        pages: {
          create: {
            title,
            creatorId: user.id,
            default: true,
            content: textToContent(""),
          },
        },
      },
    });

    await database.initiativeMember.create({
      data: {
        userId: user.id,
        initiativeId: id,
        creatorId: user.id,
        organizationId,
      },
    });

    revalidatePath("/initiatives");

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
