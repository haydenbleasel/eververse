'use client';

import { Container } from '@repo/design-system/components/container';
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
        <Container className="border-x p-16">
          <div className="mx-auto flex flex-col items-center justify-center text-center text-foreground">
            <h1 className="mt-0 mb-4 font-semibold text-3xl tracking-tighter sm:text-5xl">
              Oops, something went wrong
            </h1>
            <p className="m-0 text-muted-foreground">
              Sorry, we couldn&apos;t load this page.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => reset()}>
              Try again
            </Button>
          </div>
        </Container>
      </body>
    </html>
  );
};

export default GlobalError;
