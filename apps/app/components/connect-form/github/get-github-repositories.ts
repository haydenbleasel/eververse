'use server';

import { database } from '@/lib/database';
import type { RestEndpointMethodTypes } from '@repo/github';
import { createOctokit } from '@repo/github';
import { parseError } from '@repo/lib/parse-error';

export const getGitHubRepositories = async (): Promise<{
  repositories?: RestEndpointMethodTypes['apps']['listReposAccessibleToInstallation']['response']['data']['repositories'];
  error?: string;
}> => {
  try {
    const installation = await database.gitHubInstallation.findFirst({
      select: { installationId: true },
    });

    if (!installation) {
      throw new Error('GitHub installation not found');
    }

    const octokit = createOctokit(installation.installationId);
    const repositories = await octokit.apps.listReposAccessibleToInstallation();

    return { repositories: repositories.data.repositories };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
