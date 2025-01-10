import ky from 'ky';

export type ProductboardProduct = {
  id: string;
  name: string;
  description: string;
  owner: {
    email: string;
  } | null;
  links: {
    self: string;
    html: string;
  };
  createdAt: string;
  updatedAt: string;
};

type ProductboardError = {
  code: string;
  title: string;
  detail?: string;
  source: {
    parameter: string;
    pointer: string;
  };
};

export type GetProductsResponse =
  | {
      data: ProductboardProduct[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardProducts = async (
  url: string,
  token: string
): Promise<ProductboardProduct[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetProductsResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardProducts(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardProducts = async (
  token: string
): Promise<ProductboardProduct[]> =>
  fetchProductboardProducts('https://api.productboard.com/products', token);
