import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

export const RoadmapEmptyState = () => (
  <EmptyState
    description="You don't have any upcoming features scheduled."
    title="No upcoming features"
  >
    <Button asChild className="w-fit">
      <Link href="/features">View your backlog</Link>
    </Button>
  </EmptyState>
);
