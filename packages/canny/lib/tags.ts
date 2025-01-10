import ky from 'ky';

export type CannyTag = {
  id: string;
  board: {
    created: string;
    id: string;
    name: string;
    postCount: number;
    url: string;
  };
  created: string;
  name: string;
  postCount: number;
  url: string;
};

export const getCannyTag = async (
  apiKey: string,
  props: {
    id: string;
  }
): Promise<CannyTag> => {
  const payload = await ky
    .post('https://canny.io/api/v1/tags/retrieve', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<CannyTag | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const createCannyTag = async (
  apiKey: string,
  props: {
    boardID: string;
    name: string;
  }
): Promise<CannyTag> => {
  if (props.name.length < 1 || props.name.length > 30) {
    throw new Error('Tag name must be between 1 and 30 characters long.');
  }

  const payload = await ky
    .post('https://canny.io/api/v1/tags/create', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<CannyTag | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const fetchCannyTags = async (
  apiKey: string,
  offset = 0,
  limit = 10_000
): Promise<CannyTag[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/tags/list', {
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
          tags: CannyTag[];
          hasMore: boolean;
        }
    >();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  const tags = payload.tags;

  if (payload.hasMore) {
    const nextTags = await fetchCannyTags(apiKey, offset + 1, limit);
    return [...tags, ...nextTags];
  }

  return tags;
};

export const getCannyTags = async (
  apiKey: string,
  limit?: number
): Promise<CannyTag[]> => fetchCannyTags(apiKey, 0, limit);
