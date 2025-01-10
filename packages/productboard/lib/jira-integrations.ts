import ky from 'ky';

export type ProductboardJiraIntegration = {
  id: string;
  createdAt: string;
  integrationStatus: 'disabled' | 'enabled';
  name: string;
  links: {
    self: string;
    connections: string;
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

export type GetJiraIntegrationsResponse =
  | {
      data: ProductboardJiraIntegration[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardJiraIntegrations = async (
  url: string,
  token: string
): Promise<ProductboardJiraIntegration[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetJiraIntegrationsResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardJiraIntegrations(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardJiraIntegrations = async (
  token: string
): Promise<ProductboardJiraIntegration[]> => {
  const data = await fetchProductboardJiraIntegrations(
    'https://api.productboard.com/jira-integrations',
    token
  );

  return data.filter(
    (integration) => integration.integrationStatus === 'enabled'
  );
};
