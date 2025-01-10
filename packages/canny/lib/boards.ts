import ky from 'ky';

export type CannyBoard = {
  id: string;
  created: string;
  isPrivate: boolean;
  name: string;
  postCount: number;
  privateComments: boolean;
  token: string;
  url: string;
};

export const getCannyBoard = async (
  apiKey: string,
  props: {
    id: string;
  }
): Promise<CannyBoard> => {
  const payload = await ky
    .post('https://canny.io/api/v1/boards/retrieve', {
      json: {
        apiKey,
        id: props.id,
      },
    })
    .json<CannyBoard | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const fetchCannyBoards = async (
  apiKey: string,
  offset = 0
): Promise<CannyBoard[]> => {
  const limit = 10_000;
  const payload = await ky
    .post('https://canny.io/api/v1/boards/list', {
      json: {
        apiKey,
        limit,
        skip: offset * limit,
      },
    })
    .json<
      | {
          boards: CannyBoard[];
          hasMore: boolean;
        }
      | {
          error: string;
        }
    >();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  if (payload.hasMore) {
    const nextPayload = await fetchCannyBoards(apiKey, offset + 1);
    return [...payload.boards, ...nextPayload];
  }

  return payload.boards;
};

export const getCannyBoards = async (apiKey: string): Promise<CannyBoard[]> =>
  fetchCannyBoards(apiKey);
