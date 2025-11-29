"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import * as TooltipComponent from "../ui/tooltip";

export { TooltipProvider } from "../ui/tooltip";

export type TooltipProperties = Omit<
  ComponentProps<typeof TooltipComponent.Tooltip>,
  "delayDuration"
> & {
  readonly content: ReactNode;
  readonly side?: ComponentProps<
    typeof TooltipComponent.TooltipContent
  >["side"];
  readonly align?: ComponentProps<
    typeof TooltipComponent.TooltipContent
  >["align"];
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
      align={align}
      className={cn(
        "max-w-md rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-foreground text-sm",
        "[&_svg]:bg-background [&_svg]:fill-background"
      )}
      collisionPadding={8}
      side={side}
    >
      {content}
    </TooltipComponent.TooltipContent>
  </TooltipComponent.Tooltip>
);
