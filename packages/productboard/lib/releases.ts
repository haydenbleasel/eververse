import ky from 'ky';

export type ProductboardRelease = {
  id: string;
  name: string;
  description: string;
  archived: boolean;
  releaseGroup: {
    id: string;
    links: {
      self: string;
    };
  };
  timeframe: {
    // "2024-01-01" | "none"
    startDate: string;
    endDate: string;
    granularity: 'month' | 'none' | 'quarter' | 'year';
  };
  state: 'completed' | 'in-progress' | 'upcoming';
  links: {
    self: string;
  };
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

export type GetReleasesResponse =
  | {
      data: ProductboardRelease[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardReleases = async (
  url: string,
  token: string
): Promise<ProductboardRelease[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetReleasesResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardReleases(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardReleases = async (
  token: string
): Promise<ProductboardRelease[]> =>
  fetchProductboardReleases('https://api.productboard.com/releases', token);
