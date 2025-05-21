'use server';

import { database } from '@/lib/database';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type { Feature } from '@repo/backend/prisma/client';
import { contentToMarkdown } from '@repo/editor/lib/tiptap';
import { parseError } from '@repo/lib/parse-error';
import { LinearClient } from '@repo/linear';

type CreateLinearIssueProperties = {
  readonly teamId: string;
  readonly featureId: Feature['id'];
};

export const createLinearIssue = async ({
  teamId,
  featureId,
}: CreateLinearIssueProperties): Promise<{
  id?: string;
  href?: string;
  error?: string;
}> => {
  try {
    const [linearInstallation, feature] = await Promise.all([
      database.linearInstallation.findFirst({
        select: { accessToken: true },
      }),
      database.feature.findUnique({
        where: { id: featureId },
        select: {
          title: true,
          endAt: true,
          id: true,
        },
      }),
    ]);

    if (!linearInstallation) {
      throw new Error('Installation not found');
    }

    if (!feature) {
      throw new Error('Feature not found');
    }

    const content = await getJsonColumnFromTable(
      'feature',
      'content',
      feature.id
    );
    const description = content ? await contentToMarkdown(content) : '';

    const linear = new LinearClient({
      accessToken: linearInstallation.accessToken,
    });
    const response = await linear.createIssue({
      teamId,
      title: feature.title,
      description,
      dueDate: feature.endAt,
    });

    if (!response.success) {
      throw new Error('Issue not created');
    }

    const newIssue = await response.issue;

    if (!newIssue) {
      throw new Error('New issue not found');
    }

    return { id: newIssue.id, href: newIssue.url };
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
