import { database, getJsonColumnFromTable } from "@repo/backend/database";
import type { Feedback } from "@repo/backend/prisma/client";
import { contentToText } from "@repo/editor/lib/tiptap";
import { generateObject } from "ai";
import { z } from "zod/v3";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type InsertPayload = {
  type: "INSERT";
  table: string;
  schema: string;
  record: Feedback;
  old_record: null;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as InsertPayload;

  const content = await getJsonColumnFromTable(
    "feedback",
    "content",
    body.record.id
  );

  if (!content) {
    return new Response("No content to detect sentiment.", { status: 401 });
  }

  if (
    JSON.stringify(content) ===
    JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] })
  ) {
    return new Response("No content to detect sentiment.", { status: 401 });
  }

  const { object } = await generateObject({
    model: "openai/gpt-5-nano",
    system: [
      "You are an AI that detect the sentiment of user feedback.",
      "You are given a user feedback message and a prompt to perform sentiment analysis on it.",
    ].join("\n"),
    prompt: `${body.record.title}: ${
      content ? contentToText(content) : "No content provided."
    }`,
    schema: z.object({
      sentiment: z.enum([
        "ANGRY",
        "CONFUSED",
        "NEGATIVE",
        "POSITIVE",
        "INFORMATIVE",
        "NEUTRAL",
      ]),
      reason: z.string(),
    }),
  });

  await database.feedback.update({
    where: { id: body.record.id },
    data: {
      aiSentiment: object.sentiment,
      aiSentimentReason: object.reason,
    },
    select: { id: true },
  });

  return new Response("Success", { status: 200 });
};
