'use server';

import { database } from '@/lib/database';
import type { Feature } from '@prisma/client';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

type ConnectToJiraProperties = {
  readonly featureId: Feature['id'];
  readonly externalId: string;
  readonly href: string;
};

export const connectToJira = async ({
  featureId,
  externalId,
  href,
}: ConnectToJiraProperties): Promise<{
  error?: string;
}> => {
  try {
    const atlassianInstallation =
      await database.atlassianInstallation.findFirst({
        select: {
          id: true,
          organizationId: true,
        },
      });

    if (!atlassianInstallation) {
      throw new Error('Jira installation not found');
    }

    await database.featureConnection.create({
      data: {
        featureId,
        externalId,
        href,
        organizationId: atlassianInstallation.organizationId,
        atlassianInstallationId: atlassianInstallation.id,
      },
      select: { id: true },
    });

    revalidatePath('/features', 'page');

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
