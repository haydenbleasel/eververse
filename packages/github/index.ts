import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { keys } from './keys';

export const createOctokit = (installationId: string): Octokit =>
  new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: keys().GITHUB_APP_ID,
      privateKey: keys().GITHUB_PRIVATE_KEY,
      installationId,
    },
  });

export * from '@octokit/rest';
