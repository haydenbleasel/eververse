import { database } from "@repo/backend/database";
import type { Feedback } from "@repo/backend/prisma/client";
import { textToContent } from "@repo/editor/lib/tiptap";
import { experimental_transcribe as transcribe } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 300;
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

  if (!(body.record.videoUrl || body.record.audioUrl)) {
    return new Response("No video or audio to transcribe", { status: 401 });
  }

  const transcript = await transcribe({
    model: openai.transcription('whisper-1'),
    audio: new URL(body.record.videoUrl ?? body.record.audioUrl as string),
  });

  await database.feedback.update({
    where: { id: body.record.id },
    data: {
      transcript: transcript.text,
      content: textToContent(transcript.text ?? ""),
      transcribedAt: new Date(),
    },
    select: { id: true },
  });

  return new Response("Success", { status: 200 });
};
