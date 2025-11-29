import { Skeleton } from "@repo/design-system/components/precomposed/skeleton";
import { Suspense } from "react";
import { InitiativesEmptyState } from "@/app/(organization)/initiatives/components/initiatives-empty-state";
import { database } from "@/lib/database";
import { NewInitiativePages } from "./new-initiative-pages";
import { NewInitiatives } from "./new-initiatives";
import { InitiativesTrend } from "./trend";

export const InitiativesSection = async () => {
  const initiativeCount = await database.initiative.count();

  if (!initiativeCount) {
    return (
      <div className="p-16">
        <InitiativesEmptyState />
      </div>
    );
  }

  return (
    <section className="space-y-4 p-4 sm:p-8">
      <div>
        <p className="font-medium text-sm">Initiatives</p>
        <InitiativesTrend />
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[461px] w-full" />}>
          <NewInitiatives />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[461px] w-full" />}>
          <NewInitiativePages />
        </Suspense>
      </div>
    </section>
  );
};
