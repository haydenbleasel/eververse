"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Feedback } from "@repo/backend/prisma/client";
import { textToContent } from "@repo/editor/lib/tiptap";
import { MAX_FREE_FEEDBACK } from "@repo/lib/consts";
import { parseError } from "@repo/lib/parse-error";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

type CreateFeedbackProperties = {
  title: Feedback["title"];
  feedbackUserId: Feedback["feedbackUserId"];
  content?: object;
  audioUrl?: Feedback["audioUrl"];
  videoUrl?: Feedback["videoUrl"];
};

export const createFeedback = async ({
  title,
  content,
  feedbackUserId,
  audioUrl,
  videoUrl,
}: CreateFeedbackProperties): Promise<{
  id?: Feedback["id"];
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("You must be logged in to create feedback.");
    }

    const [feedbackCount, organization] = await Promise.all([
      database.feedback.count(),
      database.organization.findUnique({
        where: { id: organizationId },
        select: { stripeSubscriptionId: true },
      }),
    ]);

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (
      !organization.stripeSubscriptionId &&
      feedbackCount >= MAX_FREE_FEEDBACK
    ) {
      throw new Error(
        "You have reached the maximum number of feedback for your plan. Please upgrade to add more feedback."
      );
    }

    if (!organization.stripeSubscriptionId && (audioUrl ?? videoUrl)) {
      throw new Error("Please upgrade to create audio or video feedback.");
    }

    const { id } = await database.feedback.create({
      data: {
        title,
        content: content ?? textToContent(""),
        organizationId,
        feedbackUserId,
        audioUrl,
        videoUrl,
      },
      select: { id: true },
    });

    revalidatePath("/feedback", "layout");

    return { id };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
