import ky from 'ky';

export type CannyComment = {
  id: string;
  author: {
    id: string;
    created: string;
    email: string | null;
    isAdmin: boolean;
    name: string;
    url: string;
    userID: string;
  };
  board: {
    created: string;
    id: string;
    name: string;
    postCount: number;
    url: string;
  };
  created: string;
  imageURLs: string[];
  internal: boolean;
  likeCount: number;
  mentions: unknown[];
  parentID: string;
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
  private: boolean;
  reactions: {
    like: number;
  };
  value: string;
};

export const getCannyComment = async (
  apiKey: string,
  props: {
    id: string;
  }
): Promise<CannyComment> => {
  const payload = await ky
    .post('https://canny.io/api/v1/comments/retrieve', {
      json: {
        apiKey,
        id: props.id,
      },
    })
    .json<CannyComment | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const createCannyComment = async (
  apiKey: string,
  props: {
    authorID?: string;
    postID: string;
    value: string;
    imageURLs?: string[];
    internal?: boolean;
    parentID?: string;
    shouldNotifyVoters?: boolean;
  }
): Promise<{ id: CannyComment['id'] }> => {
  const payload = await ky
    .post('https://canny.io/api/v1/comments/create', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<{ id: CannyComment['id'] } | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const deleteCannyComment = async (
  apiKey: string,
  props: {
    id: string;
  }
): Promise<void> => {
  const payload = await ky
    .post('https://canny.io/api/v1/comments/delete', {
      json: {
        apiKey,
        commentID: props.id,
      },
    })
    .json<'success' | { error: string }>();

  if (payload !== 'success') {
    throw new Error(
      'error' in payload ? payload.error : 'Unknown error occurred'
    );
  }
};

export const fetchCannyComments = async (
  apiKey: string,
  offset = 0,
  limit = 10_000
): Promise<CannyComment[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/comments/list', {
      json: {
        apiKey,
        limit,
        skip: offset * limit,
      },
    })
    .json<
      | {
          comments: CannyComment[];
          hasMore: boolean;
        }
      | {
          error: string;
        }
    >();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  const comments = payload.comments;

  if (payload.hasMore) {
    const nextComments = await fetchCannyComments(apiKey, offset + 1, limit);
    return [...comments, ...nextComments];
  }

  return comments;
};

export const getCannyComments = async (
  apiKey: string,
  limit?: number
): Promise<CannyComment[]> => fetchCannyComments(apiKey, 0, limit);
