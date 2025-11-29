"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { parseError } from "@repo/lib/src/parse-error";
import { database } from "@/lib/database";

export const createSlackInstallation = async (
  webhookUrl: string
): Promise<
  | {
      error: string;
    }
  | {
      success: true;
    }
> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("Unauthorized");
    }

    await database.slackInstallation.create({
      data: {
        organizationId,
        creatorId: user.id,
        webhookUrl,
      },
      select: {
        organization: {
          select: {
            slug: true,
          },
        },
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
