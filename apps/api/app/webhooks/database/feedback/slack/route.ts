import { database, getJsonColumnFromTable } from '@repo/backend/database';
import type { Feedback } from '@repo/backend/prisma/client';
import { contentToText } from '@repo/editor/lib/tiptap';
import { baseUrl } from '@repo/lib/consts';
import { parseError } from '@repo/lib/parse-error';
import { WebClient as Slack } from '@repo/slack';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: Feedback;
  old_record: null;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as InsertPayload;
  const slack = new Slack();

  const slackInstallations = await database.slackInstallation.findMany({
    where: {
      organizationId: body.record.organizationId,
      accessToken: { not: undefined },
    },
    select: {
      id: true,
      incomingWebhookChannelId: true,
      accessToken: true,
    },
  });

  if (slackInstallations.length === 0) {
    return new Response('No Slack installations found', { status: 404 });
  }

  const [slackInstallation] = slackInstallations;

  try {
    const content = await getJsonColumnFromTable(
      'feedback',
      'content',
      body.record.id
    );

    const response = await slack.chat.postMessage({
      channel: slackInstallation.incomingWebhookChannelId,
      token: slackInstallation.accessToken,
      text: `New feedback on Eververse: *${body.record.title}*`,
      blocks: [
        {
          type: 'rich_text',
          elements: [
            {
              type: 'rich_text_section',
              elements: [
                {
                  type: 'text',
                  style: { bold: true },
                  text: `New feedback on Eververse: ${body.record.title}`,
                },
                {
                  type: 'text',
                  text: `\n${content ? contentToText(content) : 'No content provided.'}`,
                },
              ],
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Feedback',
              },
              url: new URL(`/feedback/${body.record.id}`, baseUrl).toString(),
            },
          ],
        },
      ],
    });

    if (!response.ok) {
      throw new Error(response.error);
    }

    await database.feedback.update({
      where: { id: body.record.id },
      data: {
        slackMessagePublishedAt: new Date(),
      },
    });

    return new Response('OK');
  } catch (error) {
    const message = parseError(error);

    return new Response(message, { status: 500 });
  }
};
