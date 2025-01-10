import type { PlusIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type StackCardProperties = {
  readonly title?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  readonly icon?: typeof PlusIcon;
  readonly action?: ReactNode;
  readonly variant?: 'default' | 'primary';
};

export const StackCard = ({
  title,
  children,
  className,
  icon: Icon,
  action,
  variant = 'default',
}: StackCardProperties) => (
  <div
    className={cn(
      'flex h-full flex-col divide-y overflow-hidden rounded-xl border bg-background shadow-sm',
      variant === 'primary' &&
        'divide-primary/20 border-primary/20 bg-primary/5 text-primary'
    )}
  >
    {title && (
      <div className="flex shrink-0 items-center gap-2 p-3">
        {Icon && (
          <Icon
            className={cn(
              'shrink-0 text-muted-foreground',
              variant === 'primary' && 'text-primary/50'
            )}
            size={16}
          />
        )}
        <p className="m-0 block flex-1 font-medium text-sm">{title}</p>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    <div className={cn('overflow-hidden p-3', className)}>{children}</div>
  </div>
);
