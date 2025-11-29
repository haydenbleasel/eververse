import { database } from "@repo/backend/database";
import { htmlToContent } from "@repo/editor/lib/tiptap";
import { MAX_FREE_FEEDBACK } from "@repo/lib/consts";
import { getGravatarUrl } from "@repo/lib/gravatar";
import { log } from "@repo/observability/log";
import { z } from "zod/v3";

const messageSchema = z.object({
  From: z.string(),
  MessageStream: z.string(),
  FromName: z.string(),
  FromFull: z.object({
    Email: z.string(),
    Name: z.string(),
    MailboxHash: z.string(),
  }),
  To: z.string(),
  ToFull: z.array(
    z.object({
      Email: z.string(),
      Name: z.string(),
      MailboxHash: z.string(),
    })
  ),
  Cc: z.string(),
  CcFull: z.array(
    z.object({
      Email: z.string(),
      Name: z.string(),
      MailboxHash: z.string(),
    })
  ),
  Bcc: z.string(),
  BccFull: z.array(
    z.object({
      Email: z.string(),
      Name: z.string(),
      MailboxHash: z.string(),
    })
  ),
  OriginalRecipient: z.string(),
  ReplyTo: z.string(),
  Subject: z.string(),
  MessageID: z.string(),
  Date: z.string(),
  MailboxHash: z.string(),
  TextBody: z.string(),
  HtmlBody: z.string(),
  StrippedTextReply: z.string(),
  Tag: z.string(),
  Headers: z.array(
    z.object({
      Name: z.string(),
      Value: z.string(),
    })
  ),
  Attachments: z.array(
    z.object({
      Name: z.string(),
      Content: z.string(),
      ContentType: z.string(),
      ContentLength: z.number(),
      ContentID: z.string(),
    })
  ),
});

const inboundEmailRegex = /org_([a-zA-Z0-9]+)@inbound\.eververse\.ai/;

// Should come in from reply+{organizationId}@inbound.eververse.ai
export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as object;
  const parse = messageSchema.safeParse(body);

  log.info(`Received inbound email: JSON: ${JSON.stringify(parse, null, 2)}`);

  if (!parse.success) {
    return new Response(`Bad Request: ${parse.error.errors.join(",")}`, {
      status: 400,
    });
  }

  if (parse.data.MessageStream !== "inbound") {
    return new Response("Not an inbound message", { status: 400 });
  }

  const match = [
    parse.data.To,
    parse.data.OriginalRecipient,
    parse.data.Cc,
    parse.data.Bcc,
  ]
    .flatMap((recipient) => recipient.match(inboundEmailRegex))
    .find((match) => match !== null);

  if (!match || match.length < 2) {
    log.error(
      `Invalid recipient email format: ${parse.data.To}, ${parse.data.OriginalRecipient}, ${parse.data.Cc}, ${parse.data.Bcc}`
    );
    return new Response("Invalid recipient email format", { status: 400 });
  }

  const organizationId = `org_${match[1]}`;

  const organization = await database.organization.findFirst({
    where: { id: organizationId },
    select: {
      id: true,
      stripeSubscriptionId: true,
      _count: {
        select: { feedback: true },
      },
    },
  });

  if (!organization) {
    log.error(`Organization not found: ${organizationId}`);
    return new Response("Organization not found", { status: 404 });
  }

  const email = parse.data.FromFull.Email;
  const name = parse.data.FromFull.Name;

  let feedbackUser = await database.feedbackUser.findFirst({
    where: {
      email,
      organizationId: organization.id,
    },
    select: { id: true },
  });

  if (!feedbackUser) {
    feedbackUser = await database.feedbackUser.create({
      data: {
        organizationId,
        email,
        name,
        imageUrl: await getGravatarUrl(email),
      },
      select: { id: true },
    });
  }

  if (
    !organization.stripeSubscriptionId &&
    organization._count.feedback >= MAX_FREE_FEEDBACK
  ) {
    return new Response("Upgrade your subscription to create more feedback", {
      status: 402,
    });
  }

  await database.feedback.create({
    data: {
      organizationId,
      content: htmlToContent(parse.data.HtmlBody),
      title: parse.data.Subject,
      source: "EMAIL",
      feedbackUserId: feedbackUser.id,
    },
    select: {
      id: true,
    },
  });

  return new Response("OK", { status: 200 });
};
