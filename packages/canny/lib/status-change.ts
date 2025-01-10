import ky from 'ky';

export type CannyStatusChange = {
  changeComment: {
    imageURLs: string[];
    value: string;
  };
  changer: {
    id: string;
    created: string;
    email: string | null;
    isAdmin: boolean;
    name: string;
    url: string;
    userID: string;
  };
  created: string;
  id: string;
  post: {
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
    category: {
      id: string;
      name: string;
      postCount: number;
      url: string;
    };
    changeComment: {
      value: string;
      imageURLs: string[];
    };
    commentCount: number;
    created: string;
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
  status: string;
};

export type GetCannyStatusChangesResponse =
  | {
      error: string;
    }
  | {
      statusChanges: CannyStatusChange[];
      hasMore: boolean;
    };

export const fetchCannyStatusChanges = async (
  apiKey: string,
  options: {
    boardID?: string;
  },
  offset = 0,
  limit = 10_000
): Promise<CannyStatusChange[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/status_changes/list', {
      json: {
        apiKey,
        limit,
        skip: offset * limit,
        boardID: options.boardID,
      },
    })
    .json<GetCannyStatusChangesResponse>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  const statusChanges = payload.statusChanges;

  if (payload.hasMore) {
    const nextPayload = await fetchCannyStatusChanges(
      apiKey,
      options,
      offset + 1,
      limit
    );
    return [...statusChanges, ...nextPayload];
  }

  return statusChanges;
};

export const getCannyStatusChanges = async (
  apiKey: string,
  options: {
    boardID?: string;
  },
  limit?: number
): Promise<CannyStatusChange[]> =>
  fetchCannyStatusChanges(apiKey, options, 0, limit);
