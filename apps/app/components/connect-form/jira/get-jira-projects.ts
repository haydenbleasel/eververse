'use server';

import { database } from '@/lib/database';
import { createOauth2Client } from '@repo/atlassian';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export type GetJiraProjectsResponse = {
  readonly projects: {
    id: number;
    image: string;
    title: string;
    key: string;
  }[];
};

export const getJiraProjects = async (): Promise<
  | GetJiraProjectsResponse
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

    const projects = await Promise.all(
      atlassianInstallation.resources.map(async (resource) => {
        const response = await createOauth2Client({
          accessToken: atlassianInstallation.accessToken,
          cloudId: resource.resourceId,
        }).GET('/rest/api/3/project/search');

        if (response.error) {
          throw new Error('Failed to get Jira projects');
        }

        if (!response.data.values) {
          return [];
        }

        return response.data.values?.map((project) => ({
          id: Number(project.id ?? ''),
          image: project.avatarUrls?.['48x48'] ?? '',
          title: project.name ?? '',
          key: project.key ?? '',
        }));
      })
    );

    revalidatePath('/features', 'page');

    return { projects: projects.flat() };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
