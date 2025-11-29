"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { ApiKey } from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { database } from "@/lib/database";

export const createAPIKey = async (
  name: ApiKey["name"]
): Promise<{
  error?: string;
  key?: ApiKey["key"];
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("User or organization not found");
    }

    const { key } = await database.apiKey.create({
      data: {
        name,
        creatorId: user.id,
        organizationId,
      },
      select: { key: true },
    });

    return { key };
  } catch (error) {
    const message = parseError(error);

    return {
      error: message,
    };
  }
};
