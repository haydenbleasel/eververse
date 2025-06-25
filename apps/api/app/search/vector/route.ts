import { currentOrganizationId } from '@repo/backend/auth/utils';
import { vectorSearch, vectorSearchByType } from '@repo/backend/vector-search';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<Response> => {
  try {
    const organizationId = await currentOrganizationId();
    
    if (!organizationId) {
      return new Response('Organization not found', { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') as 'feedback' | 'feature' | 'changelog' | 'release' | null;
    const limit = parseInt(searchParams.get('limit') || '10');
    const threshold = parseFloat(searchParams.get('threshold') || '0.7');

    if (!query) {
      return new Response('Query parameter "q" is required', { status: 400 });
    }

    let results;
    if (type) {
      results = await vectorSearchByType(query, organizationId, type, limit, threshold);
    } else {
      results = await vectorSearch(query, organizationId, limit, threshold);
    }

    return Response.json(results);
  } catch (error) {
    console.error('Vector search error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};