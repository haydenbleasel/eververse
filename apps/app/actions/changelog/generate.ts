'use server';

import { database } from '@/lib/database';
import { generateText } from '@repo/ai';
import { textModel } from '@repo/ai/lib/models';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import type { Changelog, Prisma } from '@repo/backend/prisma/client';
import {
  contentToText,
  markdownToContent,
  textToContent,
} from '@repo/editor/lib/tiptap';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const generateChangelog = async (
  changelogId: Changelog['id'],
  withAi: boolean
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
    ]);

    if (!user || !organizationId) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error(
        'You do not have permission to generate changelog updates'
      );
    }

    if (!withAi) {
      await database.changelog.update({
        where: { id: changelogId },
        data: { content: textToContent('') },
      });

      revalidatePath(`/changelog/${changelogId}`);

      return {};
    }

    const organization = await database.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    if (!organization.stripeSubscriptionId) {
      throw new Error('Upgrade to a paid plan to generate an update with AI.');
    }

    const lastChangelog = await database.changelog.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let content: Prisma.InputJsonValue = textToContent('');

    if (lastChangelog && organization.stripeSubscriptionId) {
      const newlyCompletedFeatures = await database.feature.findMany({
        where: {
          endAt: { gte: lastChangelog.publishAt },
          status: { complete: true },
        },
        select: {
          title: true,
          id: true,
        },
      });

      if (newlyCompletedFeatures.length > 0) {
        const promises = newlyCompletedFeatures.map(async (feature) => {
          const content = await getJsonColumnFromTable(
            'feature',
            'content',
            feature.id
          );
          const text = content
            ? contentToText(content)
            : 'No description provided.';

          return `- ${feature.title}: ${text}`.trim();
        });

        const features = await Promise.all(promises);

        const markdown = await generateText({
          model: textModel,
          system: [
            'You are an AI that takes a list of features that have been completed since the last update and potentially a product description.',
            "Your job is to generate a public-facing product update for a changelog that will be shared with the organization's customers.",
            'Do not give the update a title, as it will be generated by the user.',
            'Format your response in Markdown.',
          ].join('\n'),
          prompt: [
            'Here are the features that have been completed since the last update:',
            ...features,
            '------',
            'Here is a brief description of the product:',
            organization.productDescription ?? 'None provided.',
          ].join('\n'),
        });

        content = await markdownToContent(markdown.text);
      }
    }

    await database.changelog.update({
      where: { id: changelogId },
      data: { content },
    });

    revalidatePath(`/changelog/${changelogId}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
