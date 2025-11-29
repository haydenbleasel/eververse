"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { RoadmapEvent } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const createMarker = async (
  text: RoadmapEvent["text"],
  date: RoadmapEvent["date"]
): Promise<
  | {
      error: string;
    }
  | {
      id: string;
    }
> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("Not logged in");
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error("You don't have permission to create a marker");
    }

    const { id } = await database.roadmapEvent.create({
      data: {
        organizationId,
        text,
        date,
        creatorId: user.id,
      },
      select: { id: true },
    });

    revalidatePath("/roadmap");

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
