'use server';

import { database } from '@/lib/database';
import { createOauth2Client } from '@repo/atlassian';
import { parseError } from '@repo/lib/parse-error';
import { log } from '@repo/observability/log';
import { revalidatePath } from 'next/cache';

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
    const atlassianInstallation =
      await database.atlassianInstallation.findFirst({
        select: {
          accessToken: true,
          resources: {
            select: {
              resourceId: true,
              url: true,
            },
          },
        },
      });

    if (!atlassianInstallation) {
      throw new Error('Jira installation not found');
    }

    const issues = await Promise.all(
      atlassianInstallation.resources.map(async (resource) => {
        const response = await createOauth2Client({
          accessToken: atlassianInstallation.accessToken,
          cloudId: resource.resourceId,
        }).POST('/rest/api/3/search', {
          body: {
            jql: `(summary ~ "${query}" OR description ~ "${query}" OR text ~ "${query}")`,
          },
        });

        if (response.error) {
          log.error(`Error searching Jira issues: ${JSON.stringify(response)}`);
          throw new Error('Error searching Jira issues');
        }

        if (!response.data.issues) {
          return [];
        }

        return response.data.issues.flatMap((issue) => ({
          id: issue.id ?? '',
          image: new URL(
            (issue.fields?.issuetype as { iconUrl?: string })?.iconUrl ?? '',
            resource.url
          ).toString(),
          url: new URL(`/browse/${issue.key}`, resource.url).toString(),
          title: (issue.fields?.summary as string) ?? '',
          key: issue.key ?? '',
        }));
      })
    );

    revalidatePath('/features', 'page');

    return { issues: issues.flat() };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
