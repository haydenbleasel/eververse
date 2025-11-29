"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type {
  FeedbackOrganization,
  FeedbackUser,
} from "@repo/backend/prisma/client";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type CreateFeedbackOrganizationProperties = {
  name: FeedbackOrganization["name"];
  domain: FeedbackOrganization["domain"];
  feedbackUser: FeedbackUser["id"];
};

export const createFeedbackOrganization = async ({
  name,
  domain,
  feedbackUser,
}: CreateFeedbackOrganizationProperties): Promise<{
  id?: FeedbackOrganization["id"];
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

    const existingOrganization = await database.feedbackOrganization.findFirst({
      where: { domain },
      select: { id: true },
    });

    if (existingOrganization) {
      return { id: existingOrganization.id };
    }

    const { id } = await database.feedbackOrganization.create({
      data: {
        name,
        domain,
        organizationId,
        feedbackUsers: {
          connect: {
            id: feedbackUser,
          },
        },
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/", "layout");

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
