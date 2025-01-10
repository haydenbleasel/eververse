import ky from 'ky';

export type ProductboardNote = {
  id: string;
  title: string;
  content?: string;
  createdAt?: string;
  updatedAt: string;
  state: 'archived' | 'processed' | 'unprocessed';
  displayUrl: string;
  externalDisplayUrl?: string;
  tags: string[];
  company?: {
    id: string;
  };
  notes: {
    id: string;
    type: string;
    importance?: number;
  }[];
  followers?: {
    memberId: string;
    memberName: string;
    memberEmail: string;
    teamId: string;
    teamName: string;
  }[];
  features: {
    id: string;
    type?: 'component' | 'feature' | 'product' | 'subfeature';
    importance?: number;
  }[];
  owner?: {
    name: string;
    email: string;
  };
  source?: {
    origin: string;
    record_id: string;
  };
  user?: {
    id: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
};

export const fetchProductboardNotes = async (
  url: string,
  token: string
): Promise<ProductboardNote[]> => {
  const payload = await ky
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Version': '1',
      },
    })
    .json<
      | {
          data: ProductboardNote[];
          pageCursor: string;
          totalResults: number;
        }
      | {
          ok: boolean;
          errors: {
            source: string[];
          };
        }
    >();

  if ('errors' in payload) {
    throw new Error(payload.errors.source.join(', '));
  }

  if (payload.pageCursor) {
    const nextPayload = await fetchProductboardNotes(
      `https://api.productboard.com/notes?pageLimit=2000&pageCursor=${payload.pageCursor}`,
      token
    );

    return [...payload.data, ...nextPayload];
  }

  return payload.data;
};

export const getProductboardNotes = async (
  token: string
): Promise<ProductboardNote[]> => {
  const data = await fetchProductboardNotes(
    'https://api.productboard.com/notes?pageLimit=2000',
    token
  );

  return data.filter((note) => note.state !== 'archived');
};
