'use server';

import { database } from '@/lib/database';
import { createClient } from '@repo/atlassian';
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
    const installation = await database.atlassianInstallation.findFirst({
      select: {
        accessToken: true,
        siteUrl: true,
        email: true,
      },
    });

    if (!installation) {
      throw new Error('Jira installation not found');
    }

    const atlassian = createClient(installation);
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
      return { types: [] };
    }

    const types = response.data.map((type) => ({
      id: type.id ?? '',
      image: type.iconUrl ?? '',
      title: type.name ?? '',
      key: type.id ?? '',
    }));

    revalidatePath('/features', 'page');

    return { types };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
