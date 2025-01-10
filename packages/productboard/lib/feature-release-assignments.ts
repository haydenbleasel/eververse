import ky from 'ky';

export type ProductboardReleaseAssignment = {
  feature: {
    id: string;
    links: {
      self: string;
    };
  };
  release: {
    id: string;
    links: {
      self: string;
    };
  };
  assigned: boolean;
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

export type GetFeatureReleaseAssignmentsResponse =
  | {
      data: ProductboardReleaseAssignment[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardReleaseAssignments = async (
  url: string,
  token: string
): Promise<ProductboardReleaseAssignment[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetFeatureReleaseAssignmentsResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardReleaseAssignments(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardFeatureReleaseAssignments = async (
  token: string
): Promise<ProductboardReleaseAssignment[]> =>
  fetchProductboardReleaseAssignments(
    'https://api.productboard.com/feature-release-assignments',
    token
  );
