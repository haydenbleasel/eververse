'use client';

import { EmptyState } from '@/components/empty-state';
import { Link } from '@repo/design-system/components/link';
import { Prose } from '@repo/design-system/components/prose';
import { Button } from '@repo/design-system/components/ui/button';
import { fonts } from '@repo/design-system/lib/fonts';
import { parseError } from '@repo/lib/parse-error';
import { BugIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type GlobalErrorProperties = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const newMessage = parseError(error);

    setMessage(newMessage);
  }, [error]);

  return (
    <html lang="en" className={fonts} suppressHydrationWarning>
      <body className="grid h-screen w-screen sm:grid-cols-2">
        <div className="flex items-center justify-center">
          <EmptyState
            icon={BugIcon}
            title="Oops, something went wrong"
            description="This is on our end. We're looking into it and will get it fixed as soon as possible."
          >
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={() => reset()}>Try again</Button>
              <Button asChild variant="link">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </EmptyState>
        </div>
        <Prose className="h-full w-full max-w-none">
          <pre className="h-full w-full rounded-none border-none">
            {message}
          </pre>
        </Prose>
      </body>
    </html>
  );
};

export default GlobalError;
