import { database } from '@/lib/database';
import { Link } from '@repo/design-system/components/link';
import { StackCard } from '@repo/design-system/components/stack-card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { formatDate } from '@repo/lib/format';
import { HistoryIcon } from 'lucide-react';

export const CannyImportsCard = async () => {
  const cannyImports = await database.cannyImport.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      jobs: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!cannyImports.length) {
    return null;
  }

  return (
    <StackCard
      title="Previous imports"
      icon={HistoryIcon}
      className="divide-y p-0 text-sm"
    >
      {cannyImports.map((importItem) => (
        <div
          key={importItem.id}
          className="flex items-center justify-between gap-4 p-3"
        >
          <Link
            key={importItem.id}
            href={`/settings/import/canny/${importItem.id}`}
            className="no-underline"
          >
            Import on {formatDate(importItem.createdAt)}
          </Link>

          {importItem.jobs.some((job) => job.status !== 'SUCCESS') ? (
            <Badge variant="outline">In progress</Badge>
          ) : (
            <Badge>Success</Badge>
          )}
        </div>
      ))}
    </StackCard>
  );
};
