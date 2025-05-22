import createFetchClient from 'openapi-fetch';
import type { paths } from './types';

export const createOauth2Client = ({
  cloudId,
  accessToken,
}: {
  cloudId: string;
  accessToken: string;
}) =>
  createFetchClient<paths>({
    baseUrl: `https://api.atlassian.com/ex/jira/${cloudId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    fetch: fetch,
  });

export const createBasicAuthClient = ({
  siteUrl,
  email,
  apiToken,
}: {
  siteUrl: string;
  email: string;
  apiToken: string;
}) =>
  createFetchClient<paths>({
    baseUrl: `${siteUrl}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
    },
    fetch: fetch,
  });
