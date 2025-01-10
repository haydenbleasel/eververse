import ky from 'ky';

export type CannyVote = {
  id: string;
  board: {
    created: string;
    id: string;
    name: string;
    postCount: number;
    url: string;
  };
  by: unknown;
  created: string;
  post: {
    category: {
      id: string;
      name: string;
      postCount: number;
      url: string;
    };
    commentCount: number;
    id: string;
    imageURLs: string[];
    jira: {
      linkedIssues: {
        id: string;
        key: string;
        url: string;
      }[];
    };
    score: number;
    status: string;
    tags: {
      id: string;
      name: string;
      postCount: number;
      url: string;
    }[];
    title: string;
    url: string;
  };
  voter: {
    id: string;
    created: string;
    email: string | null;
    isAdmin: boolean;
    name: string;
    url: string;
    userID: string;
  };
  zendeskTicket: {
    url: string;
    id: number;
    created: string;
    subject: string;
    description: string;
  };
};

export const getCannyVote = async (
  apiKey: string,
  props: {
    id: string;
  }
): Promise<CannyVote> => {
  const payload = await ky
    .post('https://canny.io/api/v1/votes/retrieve', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<CannyVote | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const createCannyVote = async (
  apiKey: string,
  props: {
    postID: string;
    voterID: string;
    byID?: string;
  }
): Promise<'success'> => {
  const payload = await ky
    .post('https://canny.io/api/v1/votes/create', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<'success' | { error: string }>();

  if (payload !== 'success') {
    throw new Error(
      'error' in payload ? payload.error : 'Unknown error occurred'
    );
  }

  return payload;
};

export const deleteCannyVote = async (
  apiKey: string,
  props: {
    postID: string;
    voterID: string;
  }
): Promise<'success'> => {
  const payload = await ky
    .post('https://canny.io/api/v1/votes/delete', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<'success' | { error: string }>();

  if (payload !== 'success') {
    throw new Error(
      'error' in payload ? payload.error : 'Unknown error occurred'
    );
  }

  return payload;
};

export const fetchCannyVotes = async (
  apiKey: string,
  offset = 0,
  limit = 10_000
): Promise<CannyVote[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/votes/list', {
      json: {
        apiKey,
        limit,
        skip: offset * limit,
      },
    })
    .json<
      | {
          error: string;
        }
      | {
          votes: CannyVote[];
          hasMore: boolean;
        }
    >();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  const votes = payload.votes;

  if (payload.hasMore) {
    const nextVotes = await fetchCannyVotes(apiKey, offset + 1, limit);
    return [...votes, ...nextVotes];
  }

  return votes;
};

export const getCannyVotes = async (
  apiKey: string,
  limit?: number
): Promise<CannyVote[]> => fetchCannyVotes(apiKey, 0, limit);
