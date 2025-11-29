"use server";

import { getJsonColumnFromTable } from "@repo/backend/database";
import type { Feature } from "@repo/backend/prisma/client";
import { contentToMarkdown } from "@repo/editor/lib/tiptap";
import { createOctokit } from "@repo/github";
import { parseError } from "@repo/lib/parse-error";
import { database } from "@/lib/database";

type CreateGitHubIssueProperties = {
  readonly owner: string;
  readonly repo: string;
  readonly featureId: Feature["id"];
};

export const createGitHubIssue = async ({
  owner,
  repo,
  featureId,
}: CreateGitHubIssueProperties): Promise<{
  id?: string;
  href?: string;
  error?: string;
  number?: number;
}> => {
  try {
    const [installation, feature] = await Promise.all([
      database.gitHubInstallation.findFirst({
        select: { installationId: true },
      }),
      database.feature.findUnique({
        where: { id: featureId },
        select: {
          title: true,
          id: true,
        },
      }),
    ]);

    if (!installation) {
      throw new Error("Installation not found");
    }

    if (!feature) {
      throw new Error("Feature not found");
    }

    const octokit = createOctokit(installation.installationId);

    const content = await getJsonColumnFromTable(
      "feature",
      "content",
      feature.id
    );
    const body = content ? await contentToMarkdown(content) : "";

    const issue = await octokit.issues.create({
      owner,
      repo,
      title: feature.title,
      body,
      labels: ["eververse"],
    });

    return {
      id: `${issue.data.id}`,
      href: issue.data.html_url,
      number: issue.data.number,
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
