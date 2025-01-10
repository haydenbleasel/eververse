import ky from 'ky';

export type CannyOpportunity = {
  id: string;
  closed: boolean;
  name: string;
  postIDs: string[];
  salesforceOpportunityID: string;
  value: number;
  won: boolean;
};

export const fetchCannyOpportunities = async (
  apiKey: string,
  offset = 0,
  limit = 10_000
): Promise<CannyOpportunity[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/opportunities/list', {
      json: {
        apiKey,
        limit,
        skip: offset * limit,
      },
    })
    .json<
      | {
          opportunities: CannyOpportunity[];
          hasMore: boolean;
        }
      | {
          error: string;
        }
    >();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  const opportunities = payload.opportunities;

  if (payload.hasMore) {
    const nextOpportunities = await fetchCannyOpportunities(
      apiKey,
      offset + 1,
      limit
    );
    return [...opportunities, ...nextOpportunities];
  }

  return opportunities;
};

export const getCannyOpportunities = async (
  apiKey: string,
  limit?: number
): Promise<CannyOpportunity[]> => fetchCannyOpportunities(apiKey, 0, limit);
