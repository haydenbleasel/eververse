'use server';

import { database } from '@/lib/database';
import type { Initiative, InitiativeUpdate, Prisma } from '@prisma/client';
import { generateText } from '@repo/ai';
import { textModel } from '@repo/ai/lib/models';
import { EververseRole } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { markdownToContent, textToContent } from '@repo/editor/lib/tiptap';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const generateInitiativeUpdateContent = async (
  initiativeId: Initiative['id'],
  initiativeUpdateId: InitiativeUpdate['id']
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
        'You do not have permission to generate initiative updates'
      );
    }

    const organization = await database.organization.findFirst({
      where: { id: organizationId },
      select: { stripeSubscriptionId: true },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    if (!organization.stripeSubscriptionId) {
      throw new Error('Upgrade to a paid plan to generate an update with AI.');
    }

    const lastUpdate = await database.initiativeUpdate.findFirst({
      where: { initiativeId },
      orderBy: { createdAt: 'desc' },
    });

    let content: Prisma.InputJsonValue = textToContent('');

    if (lastUpdate && organization.stripeSubscriptionId) {
      const [newContent, members] = await Promise.all([
        database.initiative.findUnique({
          where: { id: initiativeId },
          select: {
            title: true,
            features: {
              where: {
                endAt: {
                  gte: lastUpdate.createdAt,
                },
                status: {
                  complete: true,
                },
              },
              select: {
                title: true,
                content: true,
              },
            },
            pages: {
              where: {
                createdAt: {
                  gte: lastUpdate.createdAt,
                },
              },
              select: {
                title: true,
                content: true,
              },
            },
            canvases: {
              where: {
                createdAt: {
                  gte: lastUpdate.createdAt,
                },
              },
              select: {
                title: true,
              },
            },
            externalLinks: {
              where: {
                createdAt: {
                  gte: lastUpdate.createdAt,
                },
              },
              select: {
                title: true,
                href: true,
              },
            },
            team: {
              where: {
                createdAt: {
                  gte: lastUpdate.createdAt,
                },
              },
              select: {
                userId: true,
              },
            },
          },
        }),
        currentMembers(),
      ]);

      if (newContent) {
        const markdown = await generateText({
          model: textModel,
          system: [
            'You are an AI that generates a update for an initiative that will be shared with the initiative stakeholders.',
            'You will be given a list of content that has been created for that have been completed since the last update',
            'Do not give the update a title, as it will be generated by the user.',
            'Be as specific as possible.',
            'Format your response in Markdown.',
          ].join('\n'),
          prompt: [
            `Initiative name: ${newContent.title}`,
            'Features that have been completed since the last update:',
            ...newContent.features.map(
              (feature) =>
                `- ${feature.title}: ${feature.content ?? 'No description provided.'}`
            ),
            '------',
            'Initiative pages that have been created since the last update:',
            ...newContent.pages.map(
              (page) =>
                `- ${page.title}: ${page.content ?? 'No description provided.'}`
            ),
            '------',
            'Initiative canvases that have been created since the last update:',
            ...newContent.canvases.map((canvas) => `- ${canvas.title}`),
            '------',
            'External links that have been added to the initiative since the last update:',
            ...newContent.externalLinks.map(
              (link) => `- ${link.title}: ${link.href}`
            ),
            '------',
            'Members that have been added to the initiative since the last update:',
            ...newContent.team
              .map((teamMember) => {
                const user = members.find(
                  (member) => member.id === teamMember.userId
                );

                if (!user) {
                  return null;
                }

                return `- ${getUserName(user)}`;
              })
              .filter(Boolean),
          ].join('\n'),
        });

        content = await markdownToContent(markdown.text);
      }
    }

    const update = await database.initiativeUpdate.update({
      where: {
        id: initiativeUpdateId,
      },
      data: {
        content,
      },
      select: {
        id: true,
        initiativeId: true,
      },
    });

    revalidatePath(`/initiative/${update.initiativeId}/updates/${update.id}`);

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
