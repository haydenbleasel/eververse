'use client';

import { Prose } from '@repo/design-system/components/prose';
import { Button } from '@repo/design-system/components/ui/button';
import * as Sentry from '@sentry/nextjs';
import type NextError from 'next/error';
import { useEffect } from 'react';

type GlobalErrorProperties = {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html
      lang="en"
      className="touch-manipulation scroll-smooth font-sans antialiased"
    >
      <body className="flex h-screen w-screen items-center justify-center">
        <Prose className="text-center">
          <h1>Oops, something went wrong</h1>
          <p>Sorry, we couldn&apos;t load this page.</p>
          <Button onClick={() => reset()}>Try again</Button>
        </Prose>
      </body>
    </html>
  );
};

export default GlobalError;
