import { SquareChartGanttIcon } from 'lucide-react';
import { cn } from '../lib/utils';

type LogoProperties = {
  readonly showName?: boolean;
  readonly className?: string;
};

export const Logo = ({ showName, className }: LogoProperties) => (
  <div className={cn('not-prose flex items-center gap-2', className)}>
    <SquareChartGanttIcon size={24} />
    <p
      className={cn(
        'font-semibold text-foreground text-lg tracking-tight',
        !showName && 'sr-only'
      )}
    >
      Eververse
    </p>
  </div>
);
