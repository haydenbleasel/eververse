import ky from 'ky';

export type CannyPost = {
  id: string;
  author: {
    id: string;
    created: string;
    email: string | null;
    isAdmin: boolean;
    name: string;
    url: string;
    userID: string;
  } | null;
  board: {
    created: string;
    id: string;
    name: string;
    postCount: number;
    url: string;
  };
  by: {
    id: string;
    created: string;
    email: string | null;
    isAdmin: boolean;
    name: string;
    url: string;
    userID: string;
  };
  category: {
    id: string;
    name: string;
    parentID: unknown;
    postCount: number;
    url: string;
  } | null;
  clickup: {
    linkedTasks: {
      id: string;
      linkID: string;
      name: string;
      postID: string;
      status: string;
      url: string;
    }[];
  };
  commentCount: number;
  created: string;
  customFields: {
    id: string;
    name: string;
    value: string;
  }[];
  details: string;
  eta: string;
  imageURLs: string[];
  jira: {
    linkedIssues: {
      id: string;
      key: string;
      url: string;
    }[];
  };
  mergeHistory: {
    created: string;
    post: {
      created: string;
      details: string;
      id: string;
      imageURLs: string[];
      title: string;
    };
  }[];
  owner: {
    id: string;
    created: string;
    email: string | null;
    isAdmin: boolean;
    name: string;
    url: string;
    userID: string;
  };
  score: number;
  status: string;
  statusChangedAt: string;
  tags: {
    id: string;
    name: string;
    postCount: number;
    url: string;
  }[];
  title: string;
  url: string;
};

export const getCannyPost = async (
  apiKey: string,
  props: {
    boardID?: string;
    id?: string;
    urlName?: string;
  }
): Promise<CannyPost> => {
  const payload = await ky
    .post('https://canny.io/api/v1/posts/retrieve', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<CannyPost | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const createCannyPost = async (
  apiKey: string,
  props: {
    authorID: string;
    boardID: string;
    byID?: string;
    categoryID?: string;
    customFields?: Record<string, string | number | boolean>;
    details: string;
    eta?: Date;
    etaPublic?: boolean;
    title: string;
    ownerID?: string;
    imageURLs?: string[];
    createdAt?: Date;
  }
): Promise<{ id: CannyPost['id'] }> => {
  const payload = await ky
    .post('https://canny.io/api/v1/posts/create', {
      json: {
        apiKey,
        ...props,
        eta: props.eta
          ? props.eta.toLocaleDateString('en-US', {
              month: '2-digit',
              year: 'numeric',
            })
          : undefined,
        createdAt: props.createdAt?.toISOString(),
      },
    })
    .json<{ id: CannyPost['id'] } | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const changeCannyPostCategory = async (
  apiKey: string,
  props: {
    postID: string;
    categoryID?: string | null;
  }
): Promise<CannyPost> => {
  const payload = await ky
    .post('https://canny.io/api/v1/posts/change_category', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<CannyPost | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const changeCannyPostStatus = async (
  apiKey: string,
  props: {
    changerID: string;
    postID: string;
    shouldNotifyVoters: boolean;
    status: string;
    commentValue: string;
    commentImageURLs: string[];
  }
): Promise<CannyPost> => {
  const payload = await ky
    .post('https://canny.io/api/v1/posts/change_status', {
      json: {
        apiKey,
        ...props,

        // If the comment includes line breaks, use " " instead of directly inputting the line breaks.
        commentValue: props.commentValue.replace(/\n/g, ' '),
      },
    })
    .json<CannyPost | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const addTagToCannyPost = async (
  apiKey: string,
  props: {
    postID: string;
    tagID: string;
  }
): Promise<CannyPost> => {
  const payload = await ky
    .post('https://canny.io/api/v1/posts/add_tag', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<CannyPost | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const removeTagFromCannyPost = async (
  apiKey: string,
  props: {
    postID: string;
    tagID: string;
  }
): Promise<CannyPost> => {
  const payload = await ky
    .post('https://canny.io/api/v1/posts/remove_tag', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<CannyPost | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const updateCannyPost = async (
  apiKey: string,
  props: {
    postID: string;
    customFields?: Record<string, string | number | boolean>;
    details?: string;
    eta?: Date;
    etaPublic?: boolean;
    title?: string;
    imageURLs?: string[];
  }
): Promise<void> => {
  const payload = await ky
    .post('https://canny.io/api/v1/posts/update', {
      json: {
        apiKey,
        ...props,
        eta: props.eta
          ? props.eta.toLocaleDateString('en-US', {
              month: '2-digit',
              year: 'numeric',
            })
          : undefined,
      },
    })
    .json<'success' | { error: string }>();
  if (payload !== 'success') {
    throw new Error(
      'error' in payload ? payload.error : 'Unknown error occurred'
    );
  }
};

export const fetchCannyPosts = async (
  apiKey: string,
  offset = 0,
  limit = 10_000
): Promise<CannyPost[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/posts/list', {
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
          posts: CannyPost[];
          hasMore: boolean;
        }
    >();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  const posts = payload.posts;

  if (payload.hasMore) {
    const nextPosts = await fetchCannyPosts(apiKey, offset + 1, limit);
    return [...posts, ...nextPosts];
  }

  return posts;
};

export const getCannyPosts = async (
  apiKey: string,
  limit?: number
): Promise<CannyPost[]> => fetchCannyPosts(apiKey, 0, limit);
