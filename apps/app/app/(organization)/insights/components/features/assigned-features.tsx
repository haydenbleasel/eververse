import { currentUser } from "@repo/backend/auth/utils";
import { StackCard } from "@repo/design-system/components/stack-card";
import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { database } from "@/lib/database";

export const AssignedFeatures = async () => {
  const user = await currentUser();

  if (!user) {
    return <div />;
  }

  const features = await database.feature.findMany({
    where: { ownerId: user.id },
    select: {
      id: true,
      title: true,
      createdAt: true,
      ownerId: true,
      status: {
        select: {
          name: true,
          color: true,
          complete: true,
        },
      },
    },
  });

  return (
    <StackCard className="p-0" icon={CheckCircleIcon} title="Assigned to you">
      <div className="flex flex-col gap-px p-1.5">
        {features.slice(0, 10).map((feature) => (
          <Link
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-card"
            href={`/features/${feature.id}`}
            key={feature.id}
          >
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: feature.status.color }}
            />
            <p className="flex-1 truncate font-medium">{feature.title}</p>
            <p className="shrink-0 text-muted-foreground">
              {feature.status.complete ? "Complete" : "In Progress"}
            </p>
          </Link>
        ))}
      </div>
      {features.length > 10 && (
        <div className="border-t p-3">
          <p className="text-center text-muted-foreground text-sm">
            +{features.length - 10} more
          </p>
        </div>
      )}
    </StackCard>
  );
};
