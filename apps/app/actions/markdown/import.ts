"use server";

import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import type { Prisma } from "@repo/backend/prisma/client";
import { markdownToContent } from "@repo/editor/lib/tiptap";
import { parseError } from "@repo/lib/parse-error";
import { friendlyWords } from "friendlier-words";
import { database } from "@/lib/database";

type MarkdownChangelog = {
  title: string | string[] | undefined;
  content: string | undefined;
  createdAt: string | string[] | undefined;
  slug: string | string[] | undefined;
  tags: string | string[] | undefined;
};

export const importMarkdown = async (
  changelogs: MarkdownChangelog[]
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!(user && organizationId)) {
      throw new Error("Not authorized");
    }

    // Ensure all the tags are created first so we can link them
    const existingTags = await database.changelogTag.findMany();
    const allTags = new Set<string>();

    for (const changelog of changelogs) {
      if (Array.isArray(changelog.tags)) {
        for (const tag of changelog.tags) {
          allTags.add(tag);
        }
      }
    }

    const tagsToCreate = Array.from(allTags).filter(
      (tag) => !existingTags.some(({ name }) => name === tag)
    );

    await database.changelogTag.createMany({
      data: tagsToCreate.map((tag) => ({
        name: tag,
        organizationId,
        fromMarkdown: true,
      })),
      skipDuplicates: true,
    });

    const newTags = await database.changelogTag.findMany();
    const transactions: Prisma.PrismaPromise<unknown>[] = [];

    for (const changelog of changelogs) {
      const { tags } = changelog;
      const content = changelog.content
        ? await markdownToContent(changelog.content)
        : undefined;

      const transaction = database.changelog.create({
        data: {
          organizationId,
          creatorId: user.id,
          fromMarkdown: true,
          status: "PUBLISHED",
          title:
            typeof changelog.title === "string"
              ? changelog.title
              : friendlyWords(),
          createdAt:
            typeof changelog.createdAt === "string"
              ? new Date(changelog.createdAt)
              : undefined,
          publishAt:
            typeof changelog.createdAt === "string"
              ? new Date(changelog.createdAt)
              : undefined,
          slug: typeof changelog.slug === "string" ? changelog.slug : undefined,
          content,
          tags: {
            connect: Array.isArray(tags)
              ? newTags
                  .filter((tag) => tags.includes(tag.name))
                  .map((tag) => ({ id: tag.id }))
              : [],
          },
        },
      });

      transactions.push(transaction);
    }

    // Each bucket should have 15 transactions max
    const bucketCount = Math.ceil(transactions.length / 15);

    const buckets: Prisma.PrismaPromise<unknown>[][] = Array.from({
      length: bucketCount,
    })
      .fill(0)
      .map(() => []);

    for (const [index, transaction] of transactions.entries()) {
      const bucket = index % bucketCount;

      buckets[bucket].push(transaction);
    }

    // Run database transactions sequentially to avoid deadlocks
    for (const bucket of buckets) {
      await database.$transaction(bucket);
    }

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
