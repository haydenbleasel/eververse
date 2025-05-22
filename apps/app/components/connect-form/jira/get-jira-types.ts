'use server';

import { database } from '@/lib/database';
import { createOauth2Client } from '@repo/atlassian';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export type GetJiraTypesResponse = {
  readonly types: {
    readonly id: string;
    readonly image: string;
    readonly title: string;
    readonly key: string;
  }[];
};

export const getJiraTypes = async (
  projectId: string
): Promise<
  | GetJiraTypesResponse
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

    const types = await Promise.all(
      atlassianInstallation.resources.map(async (resource) => {
        const atlassian = createOauth2Client({
          accessToken: atlassianInstallation.accessToken,
          cloudId: resource.resourceId,
        });

        const response = await atlassian.GET('/rest/api/2/issuetype/project', {
          params: {
            query: {
              projectId: Number(projectId),
            },
          },
        });

        if (response.error) {
          throw new Error('Error fetching Jira types');
        }

        if (!response.data) {
          return [];
        }

        return response.data.map((type) => ({
          id: type.id ?? '',
          image: type.iconUrl ?? '',
          title: type.name ?? '',
          key: type.id ?? '',
        }));
      })
    );

    revalidatePath('/features', 'page');

    return { types: types.flat() };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
