import { database } from "@repo/backend/database";
import type {
  FeedbackOrganization,
  FeedbackUser,
} from "@repo/backend/prisma/client";
import { textToContent } from "@repo/editor/lib/tiptap";
import { MAX_FREE_FEEDBACK } from "@repo/lib/consts";
import { getGravatarUrl } from "@repo/lib/gravatar";
import { NextResponse } from "next/server";
import { z } from "zod/v3";

const FeedbackProperties = z.object({
  title: z.string(),
  text: z.string(),
  user: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  organization: z
    .object({
      name: z.string(),
      domain: z.string(),
    })
    .optional(),
});

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as unknown;
  const parse = FeedbackProperties.safeParse(body);
  const authorization = request.headers.get("Authorization");
  const key = authorization?.split("Bearer ")[1];

  if (!key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = await database.apiKey.findFirst({
    where: { key },
    select: {
      id: true,
      organization: {
        select: {
          id: true,
          stripeSubscriptionId: true,
        },
      },
    },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!apiKey.organization.stripeSubscriptionId) {
    return NextResponse.json(
      {
        error:
          "You need to have a subscription to use the API. Please upgrade your plan.",
      },
      { status: 403 }
    );
  }

  if (!parse.success) {
    return NextResponse.json({ error: parse.error }, { status: 400 });
  }

  let feedbackOrganization: {
    id: FeedbackOrganization["id"];
  } | null = null;

  if (parse.data.organization) {
    feedbackOrganization = await database.feedbackOrganization.findFirst({
      where: {
        domain: parse.data.organization.domain,
        organizationId: apiKey.organization.id,
      },
      select: { id: true },
    });

    if (!feedbackOrganization) {
      feedbackOrganization = await database.feedbackOrganization.create({
        data: {
          domain: parse.data.organization.domain,
          name: parse.data.organization.name,
          organizationId: apiKey.organization.id,
          source: "API",
          apiKeyId: apiKey.id,
        },
        select: { id: true },
      });
    }
  }

  let feedbackUser: {
    id: FeedbackUser["id"];
    feedbackOrganizationId: FeedbackUser["feedbackOrganizationId"];
  } | null = null;

  if (parse.data.user) {
    feedbackUser = await database.feedbackUser.findFirst({
      where: {
        email: parse.data.user.email,
        organizationId: apiKey.organization.id,
      },
      select: { id: true, feedbackOrganizationId: true },
    });

    if (!feedbackUser) {
      feedbackUser = await database.feedbackUser.create({
        data: {
          email: parse.data.user.email,
          name: parse.data.user.name,
          organizationId: apiKey.organization.id,
          feedbackOrganizationId: feedbackOrganization?.id,
          imageUrl: await getGravatarUrl(parse.data.user.email),
          source: "API",
          apiKeyId: apiKey.id,
        },
        select: { id: true, feedbackOrganizationId: true },
      });
    } else if (!feedbackUser.feedbackOrganizationId) {
      feedbackUser = await database.feedbackUser.update({
        where: { id: feedbackUser.id },
        data: { feedbackOrganizationId: feedbackOrganization?.id },
        select: { id: true, feedbackOrganizationId: true },
      });
    }
  }

  const organization = await database.organization.findFirst({
    where: { id: apiKey.organization.id },
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
    throw new Error(
      "You have reached the maximum number of feedback for your plan. Please upgrade to add more feedback."
    );
  }

  await database.feedback.create({
    data: {
      content: textToContent(parse.data.text),
      organizationId: apiKey.organization.id,
      title: parse.data.title,
      feedbackUserId: feedbackUser ? feedbackUser.id : null,
      source: "API",
      apiKeyId: apiKey.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ success: true });
};
