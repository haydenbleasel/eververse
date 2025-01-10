import type { Feedback } from '@prisma/client';
import { database } from '@repo/backend/database';
import { textToContent } from '@repo/editor/lib/tiptap';
import { assembly } from '@repo/lib/assembly';

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

  if (!body.record.videoUrl && !body.record.audioUrl) {
    return new Response('No video or audio to transcribe', { status: 401 });
  }

  const transcript = await assembly.transcripts.transcribe({
    audio_url: (body.record.videoUrl ?? body.record.audioUrl) as string,
    word_boost: ['eververse'],
  });

  await database.feedback.update({
    where: { id: body.record.id },
    data: {
      transcript,
      content: textToContent(transcript.text ?? ''),
      transcribedAt: new Date(),
    },
    select: { id: true },
  });

  return new Response('Success', { status: 200 });
};
