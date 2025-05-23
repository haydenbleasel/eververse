import createFetchClient from 'openapi-fetch';
import type { paths } from './types';

export const createClient = ({
  siteUrl,
  email,
  accessToken,
}: {
  siteUrl: string;
  email: string;
  accessToken: string;
}) => {
  const Authorization = `Basic ${Buffer.from(`${email}:${accessToken}`).toString('base64')}`;

  console.log(Authorization, siteUrl);

  return createFetchClient<paths>({
    baseUrl: siteUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization,
    },
    fetch: fetch,
  });
};
