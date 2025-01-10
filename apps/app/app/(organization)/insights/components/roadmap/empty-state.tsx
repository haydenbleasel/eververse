import { EmptyState } from '@/components/empty-state';
import { Button } from '@repo/design-system/components/ui/button';
import Link from 'next/link';

export const RoadmapEmptyState = () => (
  <EmptyState
    title="No upcoming features"
    description="You don't have any upcoming features scheduled."
  >
    <Button className="w-fit" asChild>
      <Link href="/features">View your backlog</Link>
    </Button>
  </EmptyState>
);
