"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { canny_import_job_type } from "@repo/backend/prisma/client";
import { Canny } from "@repo/canny";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { createPortal } from "@/actions/portal/create";
import { database } from "@/lib/database";

const types: canny_import_job_type[] = [
  "STATUSES",
  "BOARDS",
  "CATEGORIES",
  "TAGS",
  "COMPANIES",
  "USERS",
  "POSTS",
  "CHANGELOGS",
  "VOTES",
  "COMMENTS",
  "STATUS_CHANGES",
];

export const cannyImport = async (
  token: string
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

    try {
      const canny = new Canny(token);

      await canny.post.list();
    } catch {
      throw new Error("Please provide a valid Canny token.");
    }

    const { id } = await database.cannyImport.create({
      data: {
        organizationId,
        token,
        creatorId: user.id,
        jobs: {
          create: types.map((type, index) => ({
            order: index,
            type,
            organizationId,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    const organization = await database.organization.findUnique({
      where: { id: organizationId },
      select: { onboardingType: true },
    });

    if (!organization?.onboardingType) {
      await database.organization.update({
        where: { id: organizationId },
        data: {
          onboardingType: "IMPORT",
          onboardedAt: new Date(),
        },
        select: {
          id: true,
        },
      });
    }

    const portals = await database.portal.findMany({
      select: { id: true },
    });

    if (portals.length === 0) {
      const { error } = await createPortal();

      if (error) {
        throw new Error(error);
      }
    }

    revalidatePath("/settings/import/canny");

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
