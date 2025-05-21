'use server';

import { database } from '@/lib/database';
import { createOauth2Client } from '@repo/atlassian';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type { Feature } from '@repo/backend/prisma/client';
import { convertToAdf } from '@repo/editor/lib/jira';
import { textToContent } from '@repo/editor/lib/tiptap';
import { parseError } from '@repo/lib/parse-error';

type CreateJiraIssueProperties = {
  readonly projectId: string;
  readonly typeId: string;
  readonly featureId: Feature['id'];
};

export const createJiraIssue = async ({
  projectId,
  typeId,
  featureId,
}: CreateJiraIssueProperties): Promise<{
  id?: string;
  href?: string;
  error?: string;
}> => {
  try {
    const [atlassianInstallation, feature] = await Promise.all([
      database.atlassianInstallation.findFirst({
        select: {
          accessToken: true,
          resources: {
            select: { resourceId: true, url: true },
          },
        },
      }),
      database.feature.findUnique({
        where: { id: featureId },
        select: {
          id: true,
          title: true,
          endAt: true,
        },
      }),
    ]);

    if (!atlassianInstallation) {
      throw new Error('Installation not found');
    }

    if (!feature) {
      throw new Error('Feature not found');
    }

    if (!atlassianInstallation.resources.length) {
      throw new Error('No resources found');
    }

    const [resource] = atlassianInstallation.resources;

    const content = await getJsonColumnFromTable(
      'feature',
      'content',
      feature.id
    );

    const body = content ?? textToContent('');

    const response = await createOauth2Client({
      accessToken: atlassianInstallation.accessToken,
      cloudId: resource.resourceId,
    }).POST('/rest/api/3/issue', {
      body: {
        fields: {
          description: {
            ...convertToAdf(body),
            version: 1,
          },
          duedate: feature.endAt?.toISOString().split('T')[0],
          issuetype: {
            id: typeId,
          },
          labels: ['eververse'],
          project: {
            id: projectId,
          },
          /*
           * reporter: {
           *   id: '5b10a2844c20165700ede21g',
           * },
           */
          summary: feature.title,
        },
      },
    });

    if (response.error) {
      throw new Error(
        `Error creating Jira issue: ${response.error.errorMessages?.join(', ')}`
      );
    }

    if (!response.data.id || !response.data.key) {
      throw new Error('No issue ID or key returned from Jira');
    }

    return {
      id: response.data.id,
      href: new URL(`/browse/${response.data.key}`, resource.url).toString(),
    };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
