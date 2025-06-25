import { generateEmbedding } from '@repo/ai';
import { database, getJsonColumnFromTable } from '@repo/backend/database';
import { contentToText } from '@repo/editor/lib/tiptap';

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = 'force-dynamic';

/**
 * Batch vectorize existing content that doesn't have embeddings yet
 * This endpoint can be called to process existing data
 */
export const POST = async (request: Request): Promise<Response> => {
  try {
    const { organizationId, type, limit = 10 } = await request.json();

    if (!organizationId) {
      return new Response('Organization ID is required', { status: 400 });
    }

    if (!['feedback', 'feature', 'changelog', 'release'].includes(type)) {
      return new Response('Invalid type. Must be one of: feedback, feature, changelog, release', { status: 400 });
    }

    let processedCount = 0;

    switch (type) {
      case 'feedback': {
        const feedbacks = await database.feedback.findMany({
          where: {
            organizationId,
            vector: null,
            example: false,
          },
          select: {
            id: true,
            title: true,
          },
          take: limit,
        });

        for (const feedback of feedbacks) {
          try {
            const content = await getJsonColumnFromTable('feedback', 'content', feedback.id);
            if (!content) continue;

            const text = contentToText(content);
            const fullText = `${feedback.title}\n\n${text}`;

            if (!text || text.trim() === '') continue;

            const embedding = await generateEmbedding(fullText);
            
            await database.feedback.update({
              where: { id: feedback.id },
              data: { vector: `[${embedding.join(',')}]` },
            });

            processedCount++;
          } catch (error) {
            console.error(`Failed to vectorize feedback ${feedback.id}:`, error);
          }
        }
        break;
      }

      case 'feature': {
        const features = await database.feature.findMany({
          where: {
            organizationId,
            vector: null,
            example: false,
          },
          select: {
            id: true,
            title: true,
          },
          take: limit,
        });

        for (const feature of features) {
          try {
            const content = await getJsonColumnFromTable('feature', 'content', feature.id);
            if (!content) continue;

            const text = contentToText(content);
            const fullText = `${feature.title}\n\n${text}`;

            if (!text || text.trim() === '') continue;

            const embedding = await generateEmbedding(fullText);
            
            await database.feature.update({
              where: { id: feature.id },
              data: { vector: `[${embedding.join(',')}]` },
            });

            processedCount++;
          } catch (error) {
            console.error(`Failed to vectorize feature ${feature.id}:`, error);
          }
        }
        break;
      }

      case 'changelog': {
        const changelogs = await database.changelog.findMany({
          where: {
            organizationId,
            vector: null,
            example: false,
          },
          select: {
            id: true,
            title: true,
          },
          take: limit,
        });

        for (const changelog of changelogs) {
          try {
            const content = await getJsonColumnFromTable('changelog', 'content', changelog.id);
            if (!content) continue;

            const text = contentToText(content);
            const fullText = `${changelog.title}\n\n${text}`;

            if (!text || text.trim() === '') continue;

            const embedding = await generateEmbedding(fullText);
            
            await database.changelog.update({
              where: { id: changelog.id },
              data: { vector: `[${embedding.join(',')}]` },
            });

            processedCount++;
          } catch (error) {
            console.error(`Failed to vectorize changelog ${changelog.id}:`, error);
          }
        }
        break;
      }

      case 'release': {
        const releases = await database.release.findMany({
          where: {
            organizationId,
            vector: null,
            example: false,
          },
          select: {
            id: true,
            title: true,
            description: true,
          },
          take: limit,
        });

        for (const release of releases) {
          try {
            const fullText = `${release.title}\n\n${release.description || ''}`;

            if (!release.title || release.title.trim() === '') continue;

            const embedding = await generateEmbedding(fullText);
            
            await database.release.update({
              where: { id: release.id },
              data: { vector: `[${embedding.join(',')}]` },
            });

            processedCount++;
          } catch (error) {
            console.error(`Failed to vectorize release ${release.id}:`, error);
          }
        }
        break;
      }
    }

    return Response.json({ 
      message: `Successfully vectorized ${processedCount} ${type} items`,
      processedCount,
      type,
    });

  } catch (error) {
    console.error('Batch vectorization error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};