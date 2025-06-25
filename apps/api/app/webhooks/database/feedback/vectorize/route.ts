import { generateEmbedding } from '@repo/ai';
import { database, getJsonColumnFromTable } from '@repo/backend/database';
import type { Feedback } from '@repo/backend/prisma/client';
import { contentToText } from '@repo/editor/lib/tiptap';

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

  const content = await getJsonColumnFromTable(
    'feedback',
    'content',
    body.record.id
  );

  if (!content) {
    return new Response('Feedback content not found', { status: 404 });
  }

  // Convert content to text for embedding
  const text = contentToText(content);
  const fullText = `${body.record.title}\n\n${text}`;

  // Skip if content is empty or just default structure
  if (
    !text || 
    text.trim() === '' ||
    JSON.stringify(content) === JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] })
  ) {
    return new Response('No meaningful content to vectorize', { status: 401 });
  }

  try {
    // Generate embedding for the feedback content
    const embedding = await generateEmbedding(fullText);

    // Update the feedback record with the vector embedding
    await database.feedback.update({
      where: { id: body.record.id },
      data: {
        vector: `[${embedding.join(',')}]`,
      },
      select: { id: true },
    });

    return new Response('Vector embedding generated successfully', { status: 200 });
  } catch (error) {
    console.error('Error generating vector embedding:', error);
    return new Response('Failed to generate vector embedding', { status: 500 });
  }
};