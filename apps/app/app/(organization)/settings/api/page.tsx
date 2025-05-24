import { EmptyState } from '@/components/empty-state';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { database } from '@repo/backend/database';
import { Link } from '@repo/design-system/components/link';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/design-system/components/ui/sheet';
import { createMetadata } from '@repo/seo/metadata';
import { BookIcon, SparkleIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { APIDocumentation } from './components/api-documentation';
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

  if (organization.stripeSubscriptionId) {
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
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="m-0 font-semibold text-4xl tracking-tight">API</h1>
            <p className="mb-0 text-muted-foreground">Manage your API keys.</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <BookIcon size={16} className="text-muted-foreground" />
                <span>API documentation</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Eververse API</SheetTitle>
                <SheetDescription>
                  <APIDocumentation />
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
        <Suspense fallback={<Skeleton className="aspect-video w-full" />}>
          <ApiKeysTable />
        </Suspense>
      </div>
    </div>
  );
};

export default APIPage;
