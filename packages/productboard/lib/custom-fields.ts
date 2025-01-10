import ky from 'ky';

export type ProductboardCustomField = {
  id: string;
  name: string;
  description: string;
  links: {
    self: string;
  };
} & (
  | {
      type: 'custom-description' | 'member' | 'number' | 'text';
    }
  | {
      type: 'dropdown' | 'multi-dropdown';
      options: {
        id: string;
        label: string;
      }[];
    }
);

type ProductboardError = {
  code: string;
  title: string;
  detail: string;
  source?: {
    parameter: string;
    pointer: string;
  };
};

export type GetCustomFieldsResponse =
  | {
      data: ProductboardCustomField[];
      links: {
        next: string | null;
      };
    }
  | {
      errors: ProductboardError[];
    };

export const fetchProductboardCustomFields = async (
  url: string,
  token: string
): Promise<ProductboardCustomField[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<GetCustomFieldsResponse>();

  if ('errors' in payload) {
    throw new Error(payload.errors[0].detail);
  }

  if (payload.links.next) {
    const nextPayload = await fetchProductboardCustomFields(
      payload.links.next,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

const customFieldTypes = [
  'text',
  'custom-description',
  'number',
  'dropdown',
  'multi-dropdown',
  'member',
];

export const getProductboardCustomFields = async (
  token: string
): Promise<ProductboardCustomField[]> => {
  const data = await Promise.all(
    customFieldTypes.map(async (type) =>
      fetchProductboardCustomFields(
        `https://api.productboard.com/hierarchy-entities/custom-fields?type=${type}`,
        token
      )
    )
  );

  return data.flat();
};
