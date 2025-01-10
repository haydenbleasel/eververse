'use server';

import { database } from '@/lib/database';
import type { RestEndpointMethodTypes } from '@repo/github';
import { createOctokit } from '@repo/github';
import { parseError } from '@repo/lib/parse-error';

export const getGitHubIssues = async (
  owner: string,
  repo: string
): Promise<{
  issues?: RestEndpointMethodTypes['issues']['listForRepo']['response']['data'];
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
    const issues = await octokit.issues.listForRepo({
      repo,
      owner,
    });

    return { issues: issues.data };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
