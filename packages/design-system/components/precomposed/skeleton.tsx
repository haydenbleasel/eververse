import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';
import { Skeleton as ShadcnSkeleton } from '../ui/skeleton';

type SkeletonProps = ComponentProps<typeof ShadcnSkeleton>;

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <ShadcnSkeleton {...props} className={cn('bg-foreground/10', className)} />
  );
};
