'use client';

import { EmptyState } from '@/components/empty-state';
import { Link } from '@repo/design-system/components/link';
import { Button } from '@repo/design-system/components/ui/button';
import { parseError } from '@repo/lib/parse-error';
import { BugIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type ErrorProperties = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

const ErrorPage = ({ error, reset }: ErrorProperties) => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const newMessage = parseError(error);

    setMessage(newMessage);
  }, [error]);

  return (
    <main className="grid h-screen w-screen sm:grid-cols-2">
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
      <div className="h-full w-full max-w-none">
        <pre className="h-full w-full rounded-none border-none">{message}</pre>
      </div>
    </main>
  );
};

export default ErrorPage;
