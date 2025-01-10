import { EmptyState } from '@/components/empty-state';
import { env } from '@/env';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { Link } from '@repo/design-system/components/link';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { Prose } from '@repo/design-system/components/prose';
import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import { ArrowUpRightIcon, SparkleIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ApiKeysTable } from './components/api-keys-table';

export const metadata: Metadata = createMetadata({
  title: 'API Keys',
  description: 'Manage your API keys',
});

const APIPage = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    notFound();
  }

  const organization = await database.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      stripeSubscriptionId: true,
      slug: true,
    },
  });

  if (!organization) {
    notFound();
  }

  if (!organization.stripeSubscriptionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          title="Upgrade your account"
          description="You need to subscribe to a paid plan to use the API."
          icon={SparkleIcon}
        >
          <Button asChild>
            <Link href="/subscribe">Subscribe</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="px-6 py-16">
      <Prose className="mx-auto grid w-full max-w-3xl gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 font-semibold text-4xl">API</h1>
            <p className="mt-2 mb-0 text-muted-foreground">
              Manage your API keys.
            </p>
          </div>
          <div className="not-prose">
            <Button asChild variant="outline">
              <Link href={env.DOCS_URL} className="flex items-center gap-2">
                API documentation
                <ArrowUpRightIcon size={16} />
              </Link>
            </Button>
          </div>
        </div>
        <Suspense fallback={<Skeleton className="aspect-video w-full" />}>
          <ApiKeysTable />
        </Suspense>
      </Prose>
    </div>
  );
};

export default APIPage;
