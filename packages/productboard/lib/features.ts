import ky from 'ky';

export type ProductboardFeature = {
  id: string;
  name: string;
  description: string;
  type: 'feature' | 'subfeature';
  archived: boolean;
  status: {
    id: string;
    name: string;
  };
  parent:
    | {
        component: {
          id: string;
          links: {
            self: string;
          };
        };
      }
    | {
        feature: {
          id: string;
          links: {
            self: string;
          };
        };
      }
    | {
        product: {
          id: string;
          links: {
            self: string;
          };
        };
      };
  links: {
    self: string;
    html: string;
  };
  timeframe: {
    // "2024-01-01" | "none"
    startDate: string;
    endDate: string;
    granularity: 'month' | 'none' | 'quarter' | 'year';
  };
  owner: {
    email: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  lastHealthUpdate: {
    status: 'needs-attention' | 'off-track' | 'on-track';
    message: string;
    createdAt: string;
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

export type GetFeaturesResponse =
  | {
      data: ProductboardFeature[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardFeatures = async (
  url: string,
  token: string
): Promise<ProductboardFeature[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetFeaturesResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardFeatures(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardFeatures = async (
  token: string
): Promise<ProductboardFeature[]> =>
  fetchProductboardFeatures('https://api.productboard.com/features', token);
