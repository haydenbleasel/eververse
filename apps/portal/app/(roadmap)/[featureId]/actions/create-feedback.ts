"use server";

import { database } from "@repo/backend/database";
import { textToContent } from "@repo/editor/lib/tiptap";
import { MAX_FREE_FEEDBACK } from "@repo/lib/consts";
import { getGravatarUrl } from "@repo/lib/gravatar";
import { parseError } from "@repo/lib/parse-error";

type CreateFeedbackProperties = {
  readonly email: string;
  readonly name: string;
  readonly feedback: string;
  readonly slug: string;
  readonly featureId?: string;
};

export const createFeedback = async (
  properties: CreateFeedbackProperties
): Promise<{
  error?: string;
}> => {
  try {
    const portal = await database.portal.findFirst({
      where: { slug: properties.slug },
      select: { organizationId: true },
    });

    if (!portal) {
      throw new Error("Portal not found");
    }

    let feedbackUser = await database.feedbackUser.findFirst({
      where: {
        email: properties.email,
        organizationId: portal.organizationId,
      },
    });

    if (!feedbackUser) {
      feedbackUser = await database.feedbackUser.create({
        data: {
          email: properties.email,
          name: properties.name,
          imageUrl: await getGravatarUrl(properties.email),
          organizationId: portal.organizationId,
        },
      });
    }

    const organization = await database.organization.findFirst({
      where: { id: portal.organizationId },
      select: {
        stripeSubscriptionId: true,
        _count: {
          select: { feedback: true },
        },
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (
      !organization.stripeSubscriptionId &&
      organization._count.feedback >= MAX_FREE_FEEDBACK
    ) {
      throw new Error("Upgrade your subscription to create more feedback");
    }

    const content = textToContent(properties.feedback);

    // Create new idea as feedback
    if (!properties.featureId) {
      await database.feedback.create({
        data: {
          title: "New idea from Portal",
          feedbackUserId: feedbackUser.id,
          organizationId: portal.organizationId,
          content,
        },
        select: { id: true },
      });

      return {};
    }

    // Create feedback for feature
    const portalFeature = await database.portalFeature.findFirst({
      where: {
        id: properties.featureId,
        organizationId: portal.organizationId,
      },
      select: {
        feature: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!portalFeature?.feature) {
      throw new Error("Feature not found");
    }

    const feedback = await database.feedback.create({
      data: {
        title: `Portal feedback for ${portalFeature.feature.title}`,
        feedbackUserId: feedbackUser.id,
        organizationId: portal.organizationId,
        content,
      },
      select: { id: true },
    });

    await database.feedbackFeatureLink.create({
      data: {
        feedbackId: feedback.id,
        featureId: portalFeature.feature.id,
        organizationId: portal.organizationId,
      },
    });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
