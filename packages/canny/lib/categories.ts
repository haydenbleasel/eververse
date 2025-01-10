import ky from 'ky';

export type CannyCategory = {
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
  parentID: string;
  postCount: number;
  url: string;
};

export const getCannyCategory = async (
  apiKey: string,
  props: {
    id: string;
  }
): Promise<CannyCategory> => {
  const payload = await ky
    .post('https://canny.io/api/v1/categories/retrieve', {
      json: {
        apiKey,
        id: props.id,
      },
    })
    .json<CannyCategory | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const createCannyCategory = async (
  apiKey: string,
  props: {
    boardID: string;
    name: string;
    parentID?: string;
    subscribeAdmins?: boolean;
  }
): Promise<{ id: CannyCategory['id'] }> => {
  const payload = await ky
    .post('https://canny.io/api/v1/categories/create', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<{ id: CannyCategory['id'] } | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};
export const deleteCannyCategory = async (
  apiKey: string,
  props: {
    id: CannyCategory['id'];
  }
): Promise<void> => {
  const payload = await ky
    .post('https://canny.io/api/v1/categories/delete', {
      json: {
        apiKey,
        categoryID: props.id,
      },
    })
    .json<'success' | { error: string }>();

  if (payload !== 'success') {
    throw new Error(
      'error' in payload ? payload.error : 'Unknown error occurred'
    );
  }
};

export const fetchCannyCategories = async (
  apiKey: string,
  offset = 0,
  limit = 10_000
): Promise<CannyCategory[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/categories/list', {
      json: {
        apiKey,
        limit,
        skip: offset * limit,
      },
    })
    .json<
      | {
          categories: CannyCategory[];
          hasMore: boolean;
        }
      | {
          error: string;
        }
    >();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  const categories = payload.categories;

  if (payload.hasMore) {
    const nextCategories = await fetchCannyCategories(
      apiKey,
      offset + 1,
      limit
    );
    return [...categories, ...nextCategories];
  }

  return categories;
};

export const getCannyCategories = async (
  apiKey: string,
  limit?: number
): Promise<CannyCategory[]> => fetchCannyCategories(apiKey, 0, limit);
