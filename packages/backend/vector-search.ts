import 'server-only';
import { generateEmbedding } from '@repo/ai';
import { database } from './database';

export interface VectorSearchResult {
  id: string;
  title: string;
  similarity: number;
  type: 'feedback' | 'feature' | 'changelog' | 'release';
  content?: string;
  description?: string;
}

/**
 * Search across all vectorized content using semantic similarity
 */
export const vectorSearch = async (
  query: string,
  organizationId: string,
  limit: number = 10,
  threshold: number = 0.7
): Promise<VectorSearchResult[]> => {
  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(query);
  const queryVector = `[${queryEmbedding.join(',')}]`;

  // Search across all models with vector columns using PostgreSQL vector similarity
  const feedbackResults = await database.$queryRaw<Array<{
    id: string;
    title: string;
    similarity: number;
  }>>`
    SELECT 
      id,
      title,
      (1 - (vector <=> ${queryVector}::vector)) as similarity
    FROM feedback 
    WHERE 
      "organizationId" = ${organizationId}
      AND vector IS NOT NULL
      AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
    ORDER BY vector <=> ${queryVector}::vector
    LIMIT ${limit}
  `;

  const featureResults = await database.$queryRaw<Array<{
    id: string;
    title: string;
    similarity: number;
  }>>`
    SELECT 
      id,
      title,
      (1 - (vector <=> ${queryVector}::vector)) as similarity
    FROM feature 
    WHERE 
      "organizationId" = ${organizationId}
      AND vector IS NOT NULL
      AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
    ORDER BY vector <=> ${queryVector}::vector
    LIMIT ${limit}
  `;

  const changelogResults = await database.$queryRaw<Array<{
    id: string;
    title: string;
    similarity: number;
  }>>`
    SELECT 
      id,
      title,
      (1 - (vector <=> ${queryVector}::vector)) as similarity
    FROM changelog 
    WHERE 
      "organizationId" = ${organizationId}
      AND vector IS NOT NULL
      AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
    ORDER BY vector <=> ${queryVector}::vector
    LIMIT ${limit}
  `;

  const releaseResults = await database.$queryRaw<Array<{
    id: string;
    title: string;
    similarity: number;
    description: string;
  }>>`
    SELECT 
      id,
      title,
      description,
      (1 - (vector <=> ${queryVector}::vector)) as similarity
    FROM release 
    WHERE 
      "organizationId" = ${organizationId}
      AND vector IS NOT NULL
      AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
    ORDER BY vector <=> ${queryVector}::vector
    LIMIT ${limit}
  `;

  // Combine and sort all results by similarity
  const allResults: VectorSearchResult[] = [
    ...feedbackResults.map(result => ({
      ...result,
      type: 'feedback' as const,
    })),
    ...featureResults.map(result => ({
      ...result,
      type: 'feature' as const,
    })),
    ...changelogResults.map(result => ({
      ...result,
      type: 'changelog' as const,
    })),
    ...releaseResults.map(result => ({
      ...result,
      type: 'release' as const,
    })),
  ];

  return allResults
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};

/**
 * Search within a specific content type
 */
export const vectorSearchByType = async <T extends 'feedback' | 'feature' | 'changelog' | 'release'>(
  query: string,
  organizationId: string,
  type: T,
  limit: number = 10,
  threshold: number = 0.7
): Promise<VectorSearchResult[]> => {
  const queryEmbedding = await generateEmbedding(query);
  const queryVector = `[${queryEmbedding.join(',')}]`;

  switch (type) {
    case 'feedback': {
      const results = await database.$queryRaw<Array<{
        id: string;
        title: string;
        similarity: number;
      }>>`
        SELECT 
          id,
          title,
          (1 - (vector <=> ${queryVector}::vector)) as similarity
        FROM feedback 
        WHERE 
          "organizationId" = ${organizationId}
          AND vector IS NOT NULL
          AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;
      return results.map(result => ({ ...result, type: 'feedback' as const }));
    }
    case 'feature': {
      const results = await database.$queryRaw<Array<{
        id: string;
        title: string;
        similarity: number;
      }>>`
        SELECT 
          id,
          title,
          (1 - (vector <=> ${queryVector}::vector)) as similarity
        FROM feature 
        WHERE 
          "organizationId" = ${organizationId}
          AND vector IS NOT NULL
          AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;
      return results.map(result => ({ ...result, type: 'feature' as const }));
    }
    case 'changelog': {
      const results = await database.$queryRaw<Array<{
        id: string;
        title: string;
        similarity: number;
      }>>`
        SELECT 
          id,
          title,
          (1 - (vector <=> ${queryVector}::vector)) as similarity
        FROM changelog 
        WHERE 
          "organizationId" = ${organizationId}
          AND vector IS NOT NULL
          AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;
      return results.map(result => ({ ...result, type: 'changelog' as const }));
    }
    case 'release': {
      const results = await database.$queryRaw<Array<{
        id: string;
        title: string;
        similarity: number;
        description: string;
      }>>`
        SELECT 
          id,
          title,
          description,
          (1 - (vector <=> ${queryVector}::vector)) as similarity
        FROM release 
        WHERE 
          "organizationId" = ${organizationId}
          AND vector IS NOT NULL
          AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;
      return results.map(result => ({ ...result, type: 'release' as const }));
    }
    default:
      throw new Error(`Unsupported search type: ${type}`);
  }
};