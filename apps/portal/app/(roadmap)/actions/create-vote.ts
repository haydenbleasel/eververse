"use server";

import { database } from "@repo/backend/database";
import { getGravatarUrl } from "@repo/lib/gravatar";
import { parseError } from "@repo/lib/parse-error";

type CreateVote = {
  readonly email: string;
  readonly name: string;
  readonly slug: string;
  readonly portalFeatureId: string;
};

export const createVote = async (
  properties: CreateVote
): Promise<{
  error?: string;
}> => {
  try {
    const portal = await database.portal.findFirst({
      where: { slug: properties.slug },
      select: { organizationId: true, id: true },
    });

    if (!portal) {
      throw new Error("Invalid request");
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

    const existingVote = await database.portalFeatureVote.findFirst({
      where: {
        portalFeatureId: properties.portalFeatureId,
        feedbackUserId: feedbackUser.id,
        organizationId: portal.organizationId,
      },
    });

    if (existingVote) {
      return { error: "You already voted for this feature!" };
    }

    await database.portalFeatureVote.create({
      data: {
        portalFeatureId: properties.portalFeatureId,
        organizationId: portal.organizationId,
        feedbackUserId: feedbackUser.id,
        portalId: portal.id,
      },
    });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
