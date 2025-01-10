import ky from 'ky';
import createFetchClient from 'openapi-fetch';
import type { paths } from './types';

export const createOauth2Client = ({
  cloudId,
  accessToken,
  retries = 3,
}: {
  cloudId: string;
  accessToken: string;
  retries?: number;
}) =>
  createFetchClient<paths>({
    baseUrl: `https://api.atlassian.com/ex/jira/${cloudId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    fetch: async (request) => {
      return await ky(request, {
        retry: {
          limit: retries,
        },
      });
    },
  });

export const createBasicAuthClient = ({
  siteUrl,
  email,
  apiToken,
  retries = 3,
}: {
  siteUrl: string;
  email: string;
  apiToken: string;
  retries?: number;
}) =>
  createFetchClient<paths>({
    baseUrl: `${siteUrl}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
    },
    fetch: async (request) => {
      return await ky(request, {
        retry: {
          limit: retries,
        },
      });
    },
  });
