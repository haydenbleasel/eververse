import { database } from '@repo/backend/database';
import { htmlToContent } from '@repo/editor/lib/tiptap';
import { MAX_FREE_FEEDBACK } from '@repo/lib/consts';
import { getGravatarUrl } from '@repo/lib/gravatar';
import { log } from '@repo/observability/log';
import { NextResponse } from 'next/server';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

type IntercomWebhook = {
  type: string;
  app_id: string;
  data: {
    type: string;
    item: {
      type: string;
      created_at: number;
      conversation: {
        type: string;
        id: string;
        created_at: number;
        updated_at: number;
        waiting_since: number;
        snoozed_until: null;
        source: {
          type: string;
          id: string;
          delivered_as: string;
          subject: string;
          body: string;
          author: {
            type: string;
            id: string;
            name: string;
            email: string;
          };
          attachments: never[];
          url: string;
          redacted: boolean;
        };
        contacts: {
          type: string;
          contacts: {
            type: string;
            id: string;
            external_id: string;
          }[];
        };
        first_contact_reply: {
          created_at: number;
          type: string;
          url: string;
        };
        admin_assignee_id: null;
        team_assignee_id: null;
        open: boolean;
        state: string;
        read: boolean;
        tags: {
          type: string;
          tags: {
            type: string;
            id: string;
            name: string;
            applied_at: number;
            applied_by: {
              type: string;
              id: string;
            };
          }[];
        };
        priority: string;
        sla_applied: unknown;
        statistics: {
          type: string;
          time_to_assignment: null;
          time_to_admin_reply: null;
          time_to_first_close: null;
          time_to_last_close: null;
          median_time_to_reply: null;
          first_contact_reply_at: string;
          first_assignment_at: null;
          first_admin_reply_at: null;
          first_close_at: null;
          last_assignment_at: null;
          last_assignment_admin_reply_at: null;
          last_contact_reply_at: string;
          last_admin_reply_at: null;
          last_close_at: null;
          last_closed_by_id: null;
          count_reopens: number;
          count_assignments: number;
          count_conversation_parts: number;
        };
        conversation_rating: null;
        teammates: {
          type: string;
          admins: never[];
        };
        title: string;
        custom_attributes: {
          Language: string;
        };
        topics: {
          type: string;
          topics: never[];
          total_count: number;
        };
        ticket: null;
        linked_objects: {
          type: string;
          data: never[];
          total_count: number;
          has_more: boolean;
        };
        conversation_parts: {
          type: string;
          conversation_parts: {
            assigned_to: null;
            attachments: [];
            author: {
              id: string;
              type: string;
            };
            body: string;
            created_at: number;
            external_id: null;
            id: string;
            notified_at: number;
            part_type: string;
            type: 'conversation_part';
            updated_at: number;
          }[];
          total_count: number;
        };
      };
      tag: {
        type: string;
        id: string;
        name: string;
      };
    };
  };
  links: object;
  id: string;
  topic: string;
  delivery_status: string;
  delivery_attempts: number;
  delivered_at: number;
  first_sent_at: number;
  created_at: number;
  self: null;
};

const handleConversationPartTagCreated = async (
  event: IntercomWebhook
): Promise<Response> => {
  const intercomInstallation = await database.intercomInstallation.findFirst({
    where: { appId: event.app_id },
    select: { organizationId: true },
  });

  if (!intercomInstallation) {
    return NextResponse.json(
      { message: 'Intercom installation not found' },
      { status: 404 }
    );
  }

  const tag = event.data.item.tag.name;

  if (tag.toLowerCase() !== 'eververse') {
    return new Response(null, { status: 200 });
  }

  const organization = await database.organization.findFirst({
    where: { id: intercomInstallation.organizationId },
    select: {
      stripeSubscriptionId: true,
      _count: {
        select: { feedback: true },
      },
    },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  if (
    !organization.stripeSubscriptionId &&
    organization._count.feedback >= MAX_FREE_FEEDBACK
  ) {
    return new Response('Upgrade your subscription to create more feedback', {
      status: 402,
    });
  }

  const conversationHtml: string[] = [];

  if (
    event.data.item.conversation.conversation_parts.conversation_parts.length
  ) {
    for (const part of event.data.item.conversation.conversation_parts
      .conversation_parts) {
      conversationHtml.push(part.body);
    }
  } else {
    conversationHtml.push(event.data.item.conversation.source.body);
  }

  const content = htmlToContent(conversationHtml.join('<br />'));
  const { email, name } = event.data.item.conversation.source.author;

  let feedbackUser = await database.feedbackUser.findFirst({
    where: {
      email,
      organizationId: intercomInstallation.organizationId,
    },
  });

  if (!feedbackUser) {
    feedbackUser = await database.feedbackUser.create({
      data: {
        email,
        name,
        organizationId: intercomInstallation.organizationId,
        imageUrl: await getGravatarUrl(email),
      },
    });
  }

  await database.feedback.create({
    data: {
      organizationId: intercomInstallation.organizationId,
      content,
      title: 'Feedback from Intercom',
      source: 'INTERCOM',
      feedbackUserId: feedbackUser.id,
    },
    select: { id: true },
  });

  return new Response(null, { status: 200 });
};

export const POST = async (request: Request): Promise<Response> => {
  const signature = request.headers.get('X-Hub-Signature');
  const text = await request.text();
  const event = JSON.parse(text) as IntercomWebhook;

  if (!signature) {
    log.error('Intercom: Signature missing');
    return NextResponse.json({ message: 'Signature missing' }, { status: 200 });
  }

  if (event.topic === 'conversation_part.tag.created') {
    return handleConversationPartTagCreated(event);
  }

  log.error('Intercom: Unhandled event');
  return NextResponse.json({ message: 'Unhandled event' }, { status: 200 });
};
