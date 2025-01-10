import ky from 'ky';

export type ProductboardFeatureStatus = {
  id: string;
  name: string;
  completed: boolean;
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

export type GetFeatureStatusesResponse =
  | {
      data: ProductboardFeatureStatus[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardFeatureStatuses = async (
  url: string,
  token: string
): Promise<ProductboardFeatureStatus[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetFeatureStatusesResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardFeatureStatuses(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardFeatureStatuses = async (
  token: string
): Promise<ProductboardFeatureStatus[]> =>
  fetchProductboardFeatureStatuses(
    'https://api.productboard.com/feature-statuses',
    token
  );
