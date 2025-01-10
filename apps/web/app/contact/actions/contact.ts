'use server';

import { env } from '@/env';
import { parseError } from '@repo/lib/parse-error';
import { log } from '@repo/observability/log';

type ContactProperties = {
  name: string;
  email: string;
  message: string;
};

const baseUrl = 'https://api.intercom.io/';

async function intercomFetch<T>(
  method: RequestInit['method'],
  path: string,
  body?: object
): Promise<T> {
  const url = new URL(path, baseUrl);

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Intercom-Version': '2.11',
      Accept: 'application/json',
      Authorization: `Bearer ${env.INTERCOM_ACCESS_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = (await response.json()) as {
      type: string;
      errors: {
        code: string;
        message: string;
      }[];
    };

    throw new Error(error.errors.at(0)?.message ?? 'Unknown error');
  }

  return response.json() as Promise<T>;
}

export const contact = async ({
  name,
  email,
  message,
}: ContactProperties): Promise<{
  error?: string;
}> => {
  log.info('📧 Sending contact message', { name, email, message });

  try {
    const contact = await intercomFetch<{
      id: string;
    }>('POST', '/contacts', {
      name,
      email,
      role: 'lead',
    });

    await intercomFetch<{
      id: string;
    }>('POST', '/conversations', {
      from: {
        type: 'lead',
        id: contact.id,
      },
      body: message,
    });

    log.info('📧 Contact message sent', { contact });

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
