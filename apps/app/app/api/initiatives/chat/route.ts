import { database } from '@/lib/database';
import { getUserName } from '@repo/backend/auth/format';
import { currentMembers } from '@repo/backend/auth/utils';
import { contentToText } from '@repo/editor/lib/tiptap';
import { log } from '@repo/observability/log';
import { convertToCoreMessages, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST = async (req: Request) => {
  const { messages, initiativeId, organizationId } = await req.json();

  log.info(
    `🤖 Starting initiative chat request for organization ${organizationId} and initiative ${initiativeId}`
  );

  if (!initiativeId || !organizationId) {
    log.error('🤖 Initiative ID and organization ID are required');
    return new Response('Initiative ID and organization ID are required', {
      status: 400,
    });
  }

  log.info('🤖 Fetching initiative...');
  const [initiative, organization, members] = await Promise.all([
    database.initiative.findUnique({
      where: { id: initiativeId },
      select: {
        title: true,
        emoji: true,
        createdAt: true,
        state: true,
        ownerId: true,
        creatorId: true,

        team: {
          select: {
            userId: true,
          },
        },
        canvases: {
          select: {
            title: true,
          },
        },
        externalLinks: {
          select: {
            title: true,
            href: true,
          },
        },
        features: {
          select: {
            title: true,
          },
        },
        groups: {
          select: {
            name: true,
            features: {
              select: {
                title: true,
              },
            },
          },
        },
        pages: {
          select: {
            title: true,
            default: true,
            content: true,
          },
        },
        products: {
          select: {
            name: true,
            features: {
              select: {
                title: true,
              },
            },
            groups: {
              select: {
                name: true,
                features: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    database.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
      },
    }),
    currentMembers(),
  ]);

  if (!organization) {
    log.error('🤖 Organization not found', { organizationId });
    return new Response('Organization not found', { status: 404 });
  }

  if (!initiative) {
    log.error('🤖 Initiative not found', { initiativeId });
    return new Response('Initiative not found', { status: 404 });
  }

  log.info(
    '🤖 Successfully fetched initiative and organization. Determining participants...'
  );
  const owner = members.find((member) => member.id === initiative.ownerId);
  const creator = members.find((member) => member.id === initiative.creatorId);
  const participants = members.filter((member) =>
    initiative.team.some((team) => team.userId === member.id)
  );
  const linkedFeatures = [
    ...initiative.features,
    ...initiative.groups.flatMap((group) => group.features),
    ...initiative.products.flatMap((product) => product.features),
  ];

  log.info(
    '🤖 Successfully determined participants. Fetching default page content...'
  );
  const defaultPageContent = initiative.pages.find(
    (page) => page.default
  )?.content;
  const nonDefaultPagesContent = initiative.pages
    .filter((page) => !page.default)
    .map((page) => {
      const content = page.content;

      if (!content) {
        return null;
      }

      return `${page.title}: ${contentToText(content)}`;
    });

  log.info('🤖 Successfully fetched default page content. Creating prompt...');
  const prompt = [
    "You are a helpful assistant that answers questions about a company's product initiative.",
    `The company is called "${organization.name}" and the initiative is called "${initiative.title}".`,
    'Here are all the details about the initiative:',
    `- Created At: ${initiative.createdAt}`,
    `- Created By: ${creator ? getUserName(creator) : 'Unknown'}`,
    `- Owner: ${owner ? getUserName(owner) : 'Unknown'}`,
    `- Participants: ${participants.map((participant) => getUserName(participant)).join(', ')}`,
    `- Status: ${initiative.state}`,
    `- Emoji: ${initiative.emoji}`,
    `- Linked Features: ${linkedFeatures.map((feature) => feature.title).join(', ')}`,
    `- Linked Products: ${initiative.products.map((product) => product.name).join(', ')}`,
    `- Linked Groups: ${initiative.groups.map((group) => group.name).join(', ')}`,
    `- Canvases: ${initiative.canvases.map((canvas) => canvas.title).join(', ')}`,
    `- External Links: ${initiative.externalLinks.map((link) => `${link.title}: ${link.href}`).join(', ')}`,
    `- Description: ${defaultPageContent ? contentToText(defaultPageContent) : 'None'}`,
    '---',
    'The following is a list of the pages in the initiative:',
    nonDefaultPagesContent.filter(Boolean).join('\n'),
  ].join('\n');

  log.info('🤖 Successfully created prompt. Starting stream...');
  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: prompt,
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
};
