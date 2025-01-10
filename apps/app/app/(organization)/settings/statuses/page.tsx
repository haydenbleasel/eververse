import { database } from '@/lib/database';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Prose } from '@repo/design-system/components/prose';
import { Button } from '@repo/design-system/components/ui/button';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CreateStatusButton } from './components/create-status-button';
import { FeatureStatusesList } from './components/feature-statuses-list';

export const metadata: Metadata = createMetadata({
  title: 'Customize feature statuses',
  description: 'Customize feature statuses for your organization.',
});

const StatusesSettings = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    notFound();
  }

  const statuses = await database.featureStatus.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      color: true,
      complete: true,
      features: { select: { id: true } },
      organization: { select: { stripeSubscriptionId: true } },
    },
  });

  return (
    <div className="px-6 py-16">
      <Prose className="mx-auto grid w-full max-w-3xl gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 font-semibold text-4xl">Statuses</h1>
            <p className="mt-2 mb-0 text-muted-foreground">
              Customize feature statuses for your organization.
            </p>
          </div>
          {statuses.some(
            (status) => status.organization.stripeSubscriptionId
          ) ? (
            <CreateStatusButton />
          ) : (
            <Tooltip content="Upgrade to create custom feature statuses">
              <Button variant="outline" disabled>
                Create status
              </Button>
            </Tooltip>
          )}
        </div>
        <div className="not-prose divide-y">
          <div className="grid grid-cols-12 gap-8 py-3">
            <p className="col-span-4 pl-7 font-medium text-sm">Name</p>
            <p className="col-span-3 font-medium text-sm">Color</p>
            <p className="col-span-2 font-medium text-sm">Complete</p>
            <p className="col-span-2 font-medium text-sm">Features</p>
            <div />
          </div>
          <FeatureStatusesList initialStatuses={statuses} />
        </div>
      </Prose>
    </div>
  );
};

export default StatusesSettings;
