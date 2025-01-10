'use server';

import { database } from '@/lib/database';
import type { Feature } from '@prisma/client';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { createOctokit } from '@repo/github';
import { baseUrl } from '@repo/lib/consts';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type ConnectToGitHubProperties = {
  readonly featureId: Feature['id'];
  readonly externalId: string;
  readonly href: string;
  readonly owner: string;
  readonly repo: string;
  readonly issueNumber: number;
};

export const connectToGitHub = async ({
  featureId,
  externalId,
  href,
  owner,
  repo,
  issueNumber,
}: ConnectToGitHubProperties): Promise<{
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error('Organization not found');
    }

    const githubInstallation = await database.gitHubInstallation.findFirst({
      select: {
        id: true,
        installationId: true,
      },
    });

    if (!githubInstallation) {
      throw new Error('GitHub installation not found');
    }

    await database.featureConnection.create({
      data: {
        featureId,
        externalId,
        href,
        organizationId,
        githubInstallationId: githubInstallation.id,
      },
      select: { id: true },
    });

    const octokit = createOctokit(githubInstallation.installationId);

    const eververseFeatureUrl = new URL(`/features/${featureId}`, baseUrl);

    const feature = await database.feature.findUnique({
      where: { id: featureId },
      select: { title: true },
    });

    await octokit.issues.createComment({
      body: `This issue is being tracked in [${feature?.title}](${eververseFeatureUrl.toString()}) on [Eververse](${baseUrl}).`,
      issue_number: issueNumber,
      owner,
      repo,
    });

    revalidatePath('/features');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
