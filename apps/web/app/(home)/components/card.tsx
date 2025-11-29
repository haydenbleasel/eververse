"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";
import Balancer from "react-wrap-balancer";

export const Card = ({
  title,
  description,
  feature,
  children,
  wide,
  className,
  badge,
}: {
  readonly feature: string;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
  readonly wide?: boolean;
  readonly className?: string;
  readonly badge?: string;
}) => (
  <div
    className={cn(
      "relative h-full overflow-hidden rounded-xl border bg-background p-6 shadow-sm",
      wide && "gap-4 sm:grid sm:grid-cols-3",
      className
    )}
  >
    <div className={cn("flex flex-col gap-6", wide && "justify-between")}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {feature}
        </div>
        {badge ? (
          <Badge className="rounded-full" variant="outline">
            {badge}
          </Badge>
        ) : null}
      </div>
      <div
        className={cn(
          "relative h-64 w-full overflow-hidden rounded-lg border bg-backdrop",
          wide && "sm:hidden"
        )}
      >
        {children}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="m-0 font-semibold">{title}</h3>
        <p className="m-0 text-muted-foreground">
          <Balancer>{description}</Balancer>
        </p>
      </div>
    </div>
    <div
      className={cn(
        "relative col-span-2 hidden h-96 w-full overflow-hidden rounded-lg border",
        wide && "sm:block"
      )}
    >
      <div className="relative flex h-full w-full">{children}</div>
    </div>
  </div>
);
