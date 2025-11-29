"use server";

import { getUserName } from "@repo/backend/auth/format";
import { currentMembers } from "@repo/backend/auth/utils";
import { getJsonColumnFromTable } from "@repo/backend/database";
import type { Feature } from "@repo/backend/prisma/client";
import { contentToText } from "@repo/editor/lib/tiptap";
import { FEEDBACK_PAGE_SIZE } from "@repo/lib/consts";
import { database } from "@/lib/database";

export type GetFeatureResponse = Pick<
  Feature,
  "endAt" | "id" | "ownerId" | "startAt" | "title"
> & {
  readonly text: string;
  readonly owner: {
    readonly name: string | undefined;
    readonly email: string | undefined;
    readonly imageUrl: string | undefined;
  } | null;
};

export const getFeature = async (
  page: number
): Promise<
  | {
      data: GetFeatureResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const feature = await database.feature.findFirst({
      orderBy: { createdAt: "desc" },
      skip: page * FEEDBACK_PAGE_SIZE,
      take: FEEDBACK_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
        ownerId: true,
      },
    });

    const members = await currentMembers();

    if (!feature) {
      throw new Error("Feature not found");
    }

    const owner = feature.ownerId
      ? members.find(({ id }) => id === feature.ownerId)
      : null;

    const content = await getJsonColumnFromTable(
      "feature",
      "content",
      feature.id
    );

    return {
      data: {
        ...feature,
        text: content ? contentToText(content) : "",
        owner: owner
          ? {
              name: getUserName(owner),
              email: owner.email,
              imageUrl: owner.user_metadata.imageUrl,
            }
          : null,
      },
    };
  } catch (error) {
    return { error };
  }
};
