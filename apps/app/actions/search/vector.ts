'use server';

import { currentOrganizationId } from '@repo/backend/auth/utils';
import { vectorSearch, vectorSearchByType, type VectorSearchResult } from '@repo/backend/vector-search';
import { parseError } from '@repo/lib/parse-error';

export const searchWithVector = async (
  query: string,
  type?: 'feedback' | 'feature' | 'changelog' | 'release',
  limit: number = 10,
  threshold: number = 0.7
): Promise<{
  data?: VectorSearchResult[];
  error?: string;
}> => {
  try {
    const organizationId = await currentOrganizationId();
    
    if (!organizationId) {
      throw new Error('Organization not found');
    }

    if (!query || query.trim() === '') {
      throw new Error('Search query is required');
    }

    let results: VectorSearchResult[];
    
    if (type) {
      results = await vectorSearchByType(query, organizationId, type, limit, threshold);
    } else {
      results = await vectorSearch(query, organizationId, limit, threshold);
    }

    return { data: results };
  } catch (error) {
    const message = parseError(error);
    return { error: message };
  }
};