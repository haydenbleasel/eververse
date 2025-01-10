import ky from 'ky';

export type ProductboardJiraLink = {
  featureId: string;
  connection: {
    issueId: string;
    issueKey: string;
  };
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

export type GetJiraLinksResponse =
  | {
      data: ProductboardJiraLink[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardJiraLinks = async (
  url: string,
  token: string
): Promise<ProductboardJiraLink[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetJiraLinksResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardJiraLinks(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardJiraLinks = async (
  token: string,
  integrationId: string
): Promise<ProductboardJiraLink[]> =>
  fetchProductboardJiraLinks(
    `https://api.productboard.com/jira-integrations/${integrationId}/connections`,
    token
  );
