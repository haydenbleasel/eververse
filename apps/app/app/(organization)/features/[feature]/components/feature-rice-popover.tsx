import { Button } from '@repo/design-system/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import type { ReactNode } from 'react';

type FeatureRicePopoverProperties = {
  readonly item: {
    readonly label: string;
    readonly description: string;
    readonly value: number | string;
    readonly children: ReactNode;
    readonly reason?: string;
  };
  readonly index: number;
  readonly disabled: boolean;
  readonly className?: string;
};

export const FeatureRicePopover = ({
  item,
  index,
  disabled,
  className,
}: FeatureRicePopoverProperties) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        className={cn(
          'h-9 flex-1',
          index > 0 && 'rounded-l-none border-l-0',
          index < 3 && 'rounded-r-none',
          className
        )}
        variant="outline"
        disabled={disabled}
      >
        {item.value}
      </Button>
    </PopoverTrigger>
    <PopoverContent collisionPadding={16} className="space-y-4">
      <div>
        <p className="font-medium text-foreground text-sm">{item.label}</p>
        <p className="mt-1 text-muted-foreground text-xs">{item.description}</p>
      </div>
      {item.children}
      {item.reason ? (
        <p className="text-muted-foreground text-xs">🤖 {item.reason}</p>
      ) : null}
    </PopoverContent>
  </Popover>
);
