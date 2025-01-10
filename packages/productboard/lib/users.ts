import ky from 'ky';

export type ProductboardUser = {
  id: string;
  email: string | null;
  externalId: string | null;
  name: string | null;
};

type ProductboardError = {
  code: string;
  title: string;
  detail: string;
  source?: {
    parameter: string;
    pointer: string;
  };
};

export type GetUsersResponse =
  | {
      data: ProductboardUser[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardUsers = async (
  url: string,
  token: string
): Promise<ProductboardUser[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetUsersResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardUsers(payload.links.next, token);

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardUsers = async (
  token: string
): Promise<ProductboardUser[]> =>
  fetchProductboardUsers('https://api.productboard.com/users', token);
