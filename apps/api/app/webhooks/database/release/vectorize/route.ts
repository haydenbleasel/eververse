import { generateEmbedding } from '@repo/ai';
import { database } from '@repo/backend/database';
import type { Release } from '@repo/backend/prisma/client';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: Release;
  old_record: null;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as InsertPayload;

  // For releases, we use title and description instead of content
  const title = body.record.title;
  const description = body.record.description || '';
  const fullText = `${title}\n\n${description}`;

  // Skip if content is empty 
  if (!title || title.trim() === '') {
    return new Response('No meaningful content to vectorize', { status: 401 });
  }

  try {
    // Generate embedding for the release content
    const embedding = await generateEmbedding(fullText);

    // Update the release record with the vector embedding
    await database.release.update({
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