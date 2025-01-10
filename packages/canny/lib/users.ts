import ky from 'ky';

export type CannyUser = {
  id: string;
  avatarURL: string | null;
  companies: {
    created: string;
    customFields: Record<string, string>;
    id: string;
    monthlySpend: number;
    name: string;
  }[];
  created: string;
  customFields: Record<string, string>;
  email: string | null;
  isAdmin: boolean;
  lastActivity: string;
  name: string;
  url: string;
  userID: string | null;
};

export const getCannyUser = async (
  apiKey: string,
  props: {
    email?: string;
    id?: string;
    userID?: string;
  }
): Promise<CannyUser> => {
  if (!props.email && !props.id && !props.userID) {
    throw new Error('At least one of email, id, or userID must be provided.');
  }

  const payload = await ky
    .post('https://canny.io/api/v1/users/retrieve', {
      json: {
        apiKey,
        ...props,
      },
    })
    .json<CannyUser | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const createOrUpdateCannyUser = async (
  apiKey: string,
  props: {
    alias?: string;
    avatarURL?: string;
    companies?: Array<{
      id: string;
      name: string;
      monthlySpend?: number;
      customFields?: Record<string, string>;
    }>;
    created?: Date;
    customFields?: Record<string, string | number | boolean>;
    email?: string;
    name: string;
    userID: string;
  }
): Promise<{ id: string }> => {
  const payload = await ky
    .post('https://canny.io/api/v1/users/create_or_update', {
      json: {
        apiKey,
        ...props,
        created: props.created?.toISOString(),
      },
    })
    .json<{ id: string } | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  return payload;
};

export const deleteCannyUser = async (
  apiKey: string,
  props: {
    id: string;
  }
): Promise<'success'> => {
  const payload = await ky
    .post('https://canny.io/api/v1/users/delete', {
      json: {
        apiKey,
        id: props.id,
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

export const removeCannyUserFromCompany = async (
  apiKey: string,
  props: {
    companyID: string;
    id: string;
  }
): Promise<'success'> => {
  const payload = await ky
    .post('https://canny.io/api/v1/users/remove_user_from_company', {
      json: {
        apiKey,
        companyID: props.companyID,
        id: props.id,
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

export const fetchCannyUsers = async (
  apiKey: string,
  offset = 0,
  limit = 100
): Promise<CannyUser[]> => {
  const payload = await ky
    .post('https://canny.io/api/v1/users/list', {
      json: {
        apiKey,
        limit,
        skip: offset * limit,
      },
    })
    .json<CannyUser[] | { error: string }>();

  if ('error' in payload) {
    throw new Error(payload.error);
  }

  if (payload.length === limit) {
    const nextPayload = await fetchCannyUsers(apiKey, offset + 1, limit);
    return [...payload, ...nextPayload];
  }

  return payload;
};

export const getCannyUsers = async (
  apiKey: string,
  limit?: number
): Promise<CannyUser[]> => fetchCannyUsers(apiKey, 0, limit);
