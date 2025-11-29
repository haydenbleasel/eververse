import { Link } from "@repo/design-system/components/link";
import { StackCard } from "@repo/design-system/components/stack-card";
import { Badge } from "@repo/design-system/components/ui/badge";
import { formatDate } from "@repo/lib/format";
import { HistoryIcon } from "lucide-react";
import { database } from "@/lib/database";

export const CannyImportsCard = async () => {
  const cannyImports = await database.cannyImport.findMany({
    orderBy: {
      createdAt: "desc",
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
      className="divide-y p-0 text-sm"
      icon={HistoryIcon}
      title="Previous imports"
    >
      {cannyImports.map((importItem) => (
        <div
          className="flex items-center justify-between gap-4 p-3"
          key={importItem.id}
        >
          <Link
            className="no-underline"
            href={`/settings/import/canny/${importItem.id}`}
            key={importItem.id}
          >
            Import on {formatDate(importItem.createdAt)}
          </Link>

          {importItem.jobs.some((job) => job.status !== "SUCCESS") ? (
            <Badge variant="outline">In progress</Badge>
          ) : (
            <Badge>Success</Badge>
          )}
        </div>
      ))}
    </StackCard>
  );
};
