"use server";

import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Changelog, ChangelogTag } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type CreateChangelogTagProperties = {
  changelogId: Changelog["id"];
  name: ChangelogTag["name"];
};

export const createChangelogTag = async ({
  changelogId,
  name,
}: CreateChangelogTagProperties): Promise<
  | {
      error: string;
    }
  | {
      id: ChangelogTag["id"];
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
      throw new Error("You do not have permission to create tags");
    }

    const { id } = await database.changelogTag.create({
      data: {
        name,
        organizationId,
      },
    });

    await database.changelog.update({
      where: { id: changelogId },
      data: {
        tags: {
          connect: {
            id,
          },
        },
      },
    });

    revalidatePath(`/changelog/${changelogId}`);

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
