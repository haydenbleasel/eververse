import 'server-only';
import { generateEmbedding } from '@repo/ai';
import { database, getJsonColumnFromTable } from './database';
import { contentToText } from '@repo/editor/lib/tiptap';

export interface VectorSearchResult {
  id: string;
  title: string;
  similarity: number;
  type: 'feedback' | 'feature' | 'changelog' | 'release';
  content?: string;
  description?: string;
  snippet?: string;
  createdAt?: Date;
}

/**
 * Create a snippet from text content
 */
const createSnippet = (text: string, maxLength: number = 200): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

/**
 * Search across all vectorized content using semantic similarity with enhanced results
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
    created_at: Date;
  }>>`
    SELECT 
      id,
      title,
      "createdAt" as created_at,
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
    created_at: Date;
  }>>`
    SELECT 
      id,
      title,
      "createdAt" as created_at,
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
    created_at: Date;
  }>>`
    SELECT 
      id,
      title,
      "createdAt" as created_at,
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
    created_at: Date;
  }>>`
    SELECT 
      id,
      title,
      description,
      "createdAt" as created_at,
      (1 - (vector <=> ${queryVector}::vector)) as similarity
    FROM release 
    WHERE 
      "organizationId" = ${organizationId}
      AND vector IS NOT NULL
      AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
    ORDER BY vector <=> ${queryVector}::vector
    LIMIT ${limit}
  `;

  // Enhance results with content snippets
  const enhancedResults: VectorSearchResult[] = [];

  // Process feedback results
  for (const result of feedbackResults) {
    try {
      const content = await getJsonColumnFromTable('feedback', 'content', result.id);
      const text = content ? contentToText(content) : '';
      
      enhancedResults.push({
        ...result,
        type: 'feedback',
        snippet: createSnippet(text),
        createdAt: result.created_at,
      });
    } catch (error) {
      // Fallback without content
      enhancedResults.push({
        ...result,
        type: 'feedback',
        createdAt: result.created_at,
      });
    }
  }

  // Process feature results
  for (const result of featureResults) {
    try {
      const content = await getJsonColumnFromTable('feature', 'content', result.id);
      const text = content ? contentToText(content) : '';
      
      enhancedResults.push({
        ...result,
        type: 'feature',
        snippet: createSnippet(text),
        createdAt: result.created_at,
      });
    } catch (error) {
      // Fallback without content
      enhancedResults.push({
        ...result,
        type: 'feature',
        createdAt: result.created_at,
      });
    }
  }

  // Process changelog results
  for (const result of changelogResults) {
    try {
      const content = await getJsonColumnFromTable('changelog', 'content', result.id);
      const text = content ? contentToText(content) : '';
      
      enhancedResults.push({
        ...result,
        type: 'changelog',
        snippet: createSnippet(text),
        createdAt: result.created_at,
      });
    } catch (error) {
      // Fallback without content
      enhancedResults.push({
        ...result,
        type: 'changelog',
        createdAt: result.created_at,
      });
    }
  }

  // Process release results (simpler since they don't use JSON content)
  for (const result of releaseResults) {
    enhancedResults.push({
      ...result,
      type: 'release',
      snippet: createSnippet(result.description || ''),
      createdAt: result.created_at,
    });
  }

  return enhancedResults
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
        created_at: Date;
      }>>`
        SELECT 
          id,
          title,
          "createdAt" as created_at,
          (1 - (vector <=> ${queryVector}::vector)) as similarity
        FROM feedback 
        WHERE 
          "organizationId" = ${organizationId}
          AND vector IS NOT NULL
          AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;
      
      const enhanced = [];
      for (const result of results) {
        try {
          const content = await getJsonColumnFromTable('feedback', 'content', result.id);
          const text = content ? contentToText(content) : '';
          
          enhanced.push({
            ...result,
            type: 'feedback' as const,
            snippet: createSnippet(text),
            createdAt: result.created_at,
          });
        } catch (error) {
          enhanced.push({
            ...result,
            type: 'feedback' as const,
            createdAt: result.created_at,
          });
        }
      }
      return enhanced;
    }
    case 'feature': {
      const results = await database.$queryRaw<Array<{
        id: string;
        title: string;
        similarity: number;
        created_at: Date;
      }>>`
        SELECT 
          id,
          title,
          "createdAt" as created_at,
          (1 - (vector <=> ${queryVector}::vector)) as similarity
        FROM feature 
        WHERE 
          "organizationId" = ${organizationId}
          AND vector IS NOT NULL
          AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;
      
      const enhanced = [];
      for (const result of results) {
        try {
          const content = await getJsonColumnFromTable('feature', 'content', result.id);
          const text = content ? contentToText(content) : '';
          
          enhanced.push({
            ...result,
            type: 'feature' as const,
            snippet: createSnippet(text),
            createdAt: result.created_at,
          });
        } catch (error) {
          enhanced.push({
            ...result,
            type: 'feature' as const,
            createdAt: result.created_at,
          });
        }
      }
      return enhanced;
    }
    case 'changelog': {
      const results = await database.$queryRaw<Array<{
        id: string;
        title: string;
        similarity: number;
        created_at: Date;
      }>>`
        SELECT 
          id,
          title,
          "createdAt" as created_at,
          (1 - (vector <=> ${queryVector}::vector)) as similarity
        FROM changelog 
        WHERE 
          "organizationId" = ${organizationId}
          AND vector IS NOT NULL
          AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;
      
      const enhanced = [];
      for (const result of results) {
        try {
          const content = await getJsonColumnFromTable('changelog', 'content', result.id);
          const text = content ? contentToText(content) : '';
          
          enhanced.push({
            ...result,
            type: 'changelog' as const,
            snippet: createSnippet(text),
            createdAt: result.created_at,
          });
        } catch (error) {
          enhanced.push({
            ...result,
            type: 'changelog' as const,
            createdAt: result.created_at,
          });
        }
      }
      return enhanced;
    }
    case 'release': {
      const results = await database.$queryRaw<Array<{
        id: string;
        title: string;
        similarity: number;
        description: string;
        created_at: Date;
      }>>`
        SELECT 
          id,
          title,
          description,
          "createdAt" as created_at,
          (1 - (vector <=> ${queryVector}::vector)) as similarity
        FROM release 
        WHERE 
          "organizationId" = ${organizationId}
          AND vector IS NOT NULL
          AND (1 - (vector <=> ${queryVector}::vector)) >= ${threshold}
        ORDER BY vector <=> ${queryVector}::vector
        LIMIT ${limit}
      `;
      
      return results.map(result => ({
        ...result,
        type: 'release' as const,
        snippet: createSnippet(result.description || ''),
        createdAt: result.created_at,
      }));
    }
    default:
      throw new Error(`Unsupported search type: ${type}`);
  }
};