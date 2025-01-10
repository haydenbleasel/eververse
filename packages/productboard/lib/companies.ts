import ky from 'ky';

export type ProductboardCompany = {
  id: string;
  name: string;
  domain: string;
  description: string;
  sourceOrigin: string;
  sourceRecordId: string;
};

export type GetCompaniesResponse =
  | {
      code: string;
      title: string;
      detail: string;
    }
  | {
      data: ProductboardCompany[];
      links: {
        next: string | null;
      };
    };

export const fetchProductboardCompanies = async (
  url: string,
  token: string
): Promise<ProductboardCompany[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetCompaniesResponse>();

  if ('code' in payload) {
    throw new Error(payload.detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardCompanies(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardCompanies = async (
  token: string
): Promise<ProductboardCompany[]> =>
  fetchProductboardCompanies('https://api.productboard.com/companies', token);
