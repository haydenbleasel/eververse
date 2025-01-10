import { Container } from '@repo/design-system/components/container';
import { Link } from '@repo/design-system/components/link';
import { Prose } from '@repo/design-system/components/prose';
import { Button } from '@repo/design-system/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
};

const NotFound = () => (
  <Container className="border-x p-16">
    <Prose className="mx-auto flex flex-col items-center justify-center text-center text-foreground">
      <h1 className="mt-0 mb-4 font-semibold text-3xl tracking-tighter sm:text-5xl">
        404 — Page Not Found
      </h1>
      <p className="m-0 text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Button asChild className="mt-4" variant="outline">
        <Link href="/" className="not-prose">
          Return Home
        </Link>
      </Button>
    </Prose>
  </Container>
);

export default NotFound;
