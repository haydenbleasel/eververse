import ky from 'ky';

export type CannyChangelog = {
  id: string;
  created: string;
  labels: {
    id: string;
    created: string;
    entryCount: number;
    name: string;
    url: string;
  }[];
  lastSaved: string;
  markdownDetails: string;
  plaintextDetails: string;
  posts: {
    category: {
      id: string;
      name: string;
      postCount: number;
      url: string;
    };
    commentCount: number;
    eta: string;
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
  }[];
  publishedAt: string;
  reactions: {
    like: number;
  };
  scheduledFor: string | null;
  status: 'draft' | 'published' | 'scheduled';
  title: string;
  types: ('fixed' | 'improved' | 'new')[];
  url: string;
};

export const createCannyChangelog = async (
  apiKey: string,
  props: {
    title: string;
    details: string;
    type?: 'fixed' | 'improved' | 'new';
    notify?: boolean;
    published?: boolean;
    publishedOn?: Date;
    scheduledFor?: Date;
    labelIDs?: string[];
    postIDs?: string[];
  }
): Promise<{ id: CannyChangelog['id'] }> => {
  const payload = await ky
    .post('https://canny.io/api/v1/entries/create', {
      json: {
        apiKey,
        ...props,
        publishedOn: props.publishedOn?.toISOString(),
        scheduledFor: props.scheduledFor?.toISOString(),
      },
    })
    .json<{ id: CannyChangelog['id'] } | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const fetchCannyChangelogs = async (
  apiKey: string,
  offset = 0,
  limit = 10_000
): Promise<CannyChangelog[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/entries/list', {
      json: {
        apiKey,
        limit,
        skip: offset * limit,
      },
    })
    .json<
      | {
          entries: CannyChangelog[];
          hasMore: boolean;
        }
      | {
          error: string;
        }
    >();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  const changelogs = payload.entries;

  if (payload.hasMore) {
    const nextChangelogs = await fetchCannyChangelogs(
      apiKey,
      offset + 1,
      limit
    );
    return [...changelogs, ...nextChangelogs];
  }

  return changelogs;
};

export const getCannyChangelogs = async (
  apiKey: string,
  limit?: number
): Promise<CannyChangelog[]> => fetchCannyChangelogs(apiKey, 0, limit);
