import { log } from '@repo/observability/log';
import { captureException } from '@sentry/nextjs';

export const parseError = (error: unknown): string => {
  let message = 'An error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = error.message as string;
  } else {
    message = String(error);
  }

  try {
    captureException(error);
    log.error(`Parsing error: ${message}`);
  } catch (_newError) {}

  return message;
};
