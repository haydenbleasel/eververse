import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { Skeleton } from '@repo/design-system/components/precomposed/skeleton';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { TeamSubscribe } from './team-subscribe';

const GlobalBreadcrumbs = dynamic(
  () => import('./global-breadcrumbs').then((mod) => mod.GlobalBreadcrumbs),
  {
    loading: () => (
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-10" />
        <ChevronRight size={16} className="text-muted-foreground" />
        <Skeleton className="h-4 w-10" />
      </div>
    ),
  }
);

export const Navbar = () => (
  <div className="flex shrink-0 items-center justify-between gap-8 border-b px-4 py-2.5">
    <div className="flex items-center gap-4">
      <SidebarTrigger className="text-muted-foreground" />
      <GlobalBreadcrumbs />
    </div>
    <Suspense fallback={<LoadingCircle />}>
      <TeamSubscribe />
    </Suspense>
  </div>
);
