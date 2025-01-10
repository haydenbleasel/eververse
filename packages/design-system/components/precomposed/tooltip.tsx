'use client';

import type { ComponentProps, ReactNode } from 'react';
import * as TooltipComponent from '../ui/tooltip';

export { TooltipProvider } from '../ui/tooltip';

export type TooltipProperties = Omit<
  ComponentProps<typeof TooltipComponent.Tooltip>,
  'delayDuration'
> & {
  readonly content: ReactNode;
  readonly side?: ComponentProps<
    typeof TooltipComponent.TooltipContent
  >['side'];
  readonly align?: ComponentProps<
    typeof TooltipComponent.TooltipContent
  >['align'];
};

export const Tooltip = ({
  children,
  content,
  side,
  align,
  ...properties
}: TooltipProperties) => (
  <TooltipComponent.Tooltip delayDuration={0} {...properties}>
    <TooltipComponent.TooltipTrigger asChild>
      <div>{children}</div>
    </TooltipComponent.TooltipTrigger>
    <TooltipComponent.TooltipContent
      collisionPadding={8}
      side={side}
      align={align}
      className="max-w-md rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-foreground text-sm"
    >
      {content}
    </TooltipComponent.TooltipContent>
  </TooltipComponent.Tooltip>
);
