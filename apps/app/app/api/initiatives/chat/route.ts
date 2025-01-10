import { database } from '@/lib/database';
import { convertToCoreMessages, streamText } from '@repo/ai';
import { textModel } from '@repo/ai/lib/models';
import { getUserName } from '@repo/backend/auth/format';
import { currentMembers } from '@repo/backend/auth/utils';
import { contentToText } from '@repo/editor/lib/tiptap';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, initiativeId, organizationId } = await req.json();

  if (!initiativeId || !organizationId) {
    return new Response('Initiative ID and organization ID are required', {
      status: 400,
    });
  }

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
    return new Response('Organization not found', { status: 404 });
  }

  if (!initiative) {
    return new Response('Initiative not found', { status: 404 });
  }

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

  const result = await streamText({
    model: textModel,
    system: [
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
    ].join('\n'),
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
