'use server';

import { env } from '@/env';
import { database } from '@/lib/database';
import type { InitiativeUpdate } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { contentToHtml, contentToText } from '@repo/editor/lib/tiptap';
import { resend } from '@repo/email';
import { InitiativeUpdateTemplate } from '@repo/email/templates/initiative-update';
import { parseError } from '@repo/lib/parse-error';
import { revalidatePath } from 'next/cache';

export const sendInitiativeUpdate = async (
  initiativeUpdateId: InitiativeUpdate['id']
): Promise<{
  error?: string;
}> => {
  try {
    const [user, organizationId, members] = await Promise.all([
      currentUser(),
      currentOrganizationId(),
      currentMembers(),
    ]);

    if (!user || !organizationId) {
      throw new Error('Not logged in');
    }

    if (user.user_metadata.organization_role === EververseRole.Member) {
      throw new Error('You do not have permission to send initiative updates');
    }

    const [update, content] = await Promise.all([
      database.initiativeUpdate.findFirst({
        where: { id: initiativeUpdateId },
        select: {
          title: true,
          creatorId: true,
          initiative: {
            select: {
              id: true,
              team: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      }),
      getJsonColumnFromTable(
        'initiative_update',
        'content',
        initiativeUpdateId
      ),
    ]);

    if (!update) {
      throw new Error('Initiative update not found');
    }

    if (!update.initiative.team.length) {
      throw new Error('No team members found.');
    }

    if (!content || !Object.keys(content).length) {
      throw new Error('Initiative update content not found');
    }

    const [users, html, text, owner] = await Promise.all([
      members.filter((member) =>
        update.initiative.team.some(({ userId }) => userId === member.id)
      ),
      contentToHtml(content),
      contentToText(content),
      members.find((member) => member.id === update.creatorId),
    ]);

    if (!owner) {
      throw new Error('Owner not found.');
    }

    if (!users.length) {
      throw new Error('No users found.');
    }

    const emails = users.map((user) => user.email).filter(Boolean) as string[];

    if (!emails.length) {
      throw new Error('No emails found.');
    }

    const response = await resend.emails.send({
      from: env.RESEND_FROM,
      to: emails,
      subject: update.title,
      replyTo: owner.email,
      react: (
        <InitiativeUpdateTemplate
          date={new Date()}
          title={update.title}
          name={getUserName(owner)}
          html={html}
        />
      ),
      text,
    });

    if (response.error) {
      throw new Error(`${response.error.name}: ${response.error.message}`);
    }

    await database.initiativeUpdate.update({
      where: { id: initiativeUpdateId },
      data: { emailSentAt: new Date() },
    });

    revalidatePath(
      `/initiative/${update.initiative.id}/updates/${initiativeUpdateId}`
    );

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
