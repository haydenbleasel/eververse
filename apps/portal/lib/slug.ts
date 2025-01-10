import { headers } from 'next/headers';
import 'server-only';

export const getSlug = async (): Promise<string | null> => {
  const head = await headers();
  const host = head.get('host');

  if (!host) {
    return null;
  }

  const segments = host.split('.');

  if (segments.length !== 3) {
    return null;
  }

  return segments[0] ?? null;
};
