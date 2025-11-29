"use server";

import { createClient } from "@repo/atlassian";
import { parseError } from "@repo/lib/parse-error";
import { log } from "@repo/observability/log";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export type SearchJiraIssuesResponse = {
  readonly issues: {
    readonly id: string;
    readonly image: string;
    readonly url: string;
    readonly title: string;
    readonly key: string;
  }[];
};

export const searchJiraIssues = async (
  query: string
): Promise<
  | SearchJiraIssuesResponse
  | {
      error: string;
    }
> => {
  try {
    const installation = await database.atlassianInstallation.findFirst({
      select: {
        accessToken: true,
        siteUrl: true,
        email: true,
      },
    });

    if (!installation) {
      throw new Error("Jira installation not found");
    }

    const atlassian = createClient(installation);
    const response = await atlassian.POST("/rest/api/2/search", {
      body: {
        jql: `(summary ~ "${query}" OR description ~ "${query}" OR text ~ "${query}")`,
        maxResults: 100,
      },
    });

    if (response.error) {
      log.error(`Error searching Jira issues: ${JSON.stringify(response)}`);
      throw new Error("Error searching Jira issues");
    }

    if (!response.data?.issues) {
      return { issues: [] };
    }

    const issues = response.data.issues.flatMap((issue) => ({
      id: issue.id ?? "",
      image: new URL(
        (issue.fields?.issuetype as { iconUrl?: string })?.iconUrl ?? "",
        installation.siteUrl
      ).toString(),
      url: new URL(`/browse/${issue.key}`, installation.siteUrl).toString(),
      title: (issue.fields?.summary as string) ?? "",
      key: issue.key ?? "",
    }));

    revalidatePath("/features", "page");

    return { issues };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
