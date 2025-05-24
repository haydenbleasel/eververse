import { database } from '@/lib/database';
import { getUserName } from '@repo/backend/auth/format';
import { currentMembers } from '@repo/backend/auth/utils';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { cn } from '@repo/design-system/lib/utils';
import { formatDate } from '@repo/lib/format';
import { createMetadata } from '@repo/seo/metadata';
import { ListIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import pluralize from 'pluralize';

const title = 'Productboard Import';
const description = 'Track the progress of your Productboard import.';

export const metadata: Metadata = createMetadata({
  title,
  description,
});

type ProductboardImportInstanceProps = {
  params: Promise<{
    import: string;
  }>;
};

// Replace underscores with spaces and capitalize the first letter of each word
const formatName = (name: string): string =>
  name
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const ProductboardImportInstance = async (
  props: ProductboardImportInstanceProps
) => {
  const params = await props.params;
  const productboardImport = await database.productboardImport.findUnique({
    where: { id: params.import },
    select: {
      creatorId: true,
      createdAt: true,
      organizationId: true,
      jobs: {
        select: {
          status: true,
          finishedAt: true,
          error: true,
          count: true,
          id: true,
          type: true,
        },
      },
    },
  });

  if (!productboardImport) {
    notFound();
  }

  const members = await currentMembers();
  const owner = members.find(({ id }) => id === productboardImport.creatorId);

  return (
    <div className="grid gap-6">
      <Image
        src="/productboard.svg"
        width={32}
        height={32}
        className="m-0 h-8 w-8"
        alt=""
      />
      <div>
        <h1 className="m-0 font-semibold text-4xl tracking-tight">
          Import on {formatDate(productboardImport.createdAt)}
        </h1>
        <p className="mt-2 mb-0 text-muted-foreground">
          Created by {owner ? getUserName(owner) : 'Unknown'}
        </p>
      </div>
      <StackCard title="Progress" icon={ListIcon} className="p-0">
        <div className="divide-y text-sm">
          {productboardImport.jobs.map((job) => (
            <div className="flex items-center justify-between p-3" key={job.id}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    job.status === 'SUCCESS' && 'bg-success',
                    job.status === 'FAILURE' && 'bg-destructive',
                    job.status === 'PENDING' && 'bg-muted-foreground',
                    job.status === 'RUNNING' && 'bg-warning'
                  )}
                />
                <span>{formatName(job.type)}</span>
                <span>({formatName(job.status)})</span>
              </div>
              <div className="flex items-center gap-2">
                {job.error ? (
                  <Tooltip content={job.error}>
                    <Badge variant="destructive">Error</Badge>
                  </Tooltip>
                ) : null}
                {job.status === 'SUCCESS' ? (
                  <Badge>Imported {pluralize('item', job.count, true)}</Badge>
                ) : null}
                {job.finishedAt ? (
                  <Badge variant="secondary">
                    Finished {formatDate(job.finishedAt)}
                  </Badge>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </StackCard>
    </div>
  );
};

export default ProductboardImportInstance;
