import { Breadcrumbs } from "@repo/design-system/components/precomposed/breadcrumbs";
import { Badge } from "@repo/design-system/components/ui/badge";
import type { ReactNode } from "react";

type HeaderProperties = {
  readonly title: string;
  readonly children?: ReactNode;
  readonly badge?: number;
  readonly breadcrumbs?: {
    readonly href: string;
    readonly text: string;
  }[];
};

export const Header = ({
  breadcrumbs,
  title,
  children,
  badge,
}: HeaderProperties) => (
  <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-backdrop/90 p-3 backdrop-blur-sm">
    <div className="flex items-center gap-1 font-medium text-sm">
      {(breadcrumbs ?? title) ? (
        <Breadcrumbs data={breadcrumbs ?? []} title={title} />
      ) : null}
      {badge ? (
        <Badge className="-my-1" variant="outline">
          {badge}
        </Badge>
      ) : null}
    </div>
    <div className="flex items-center gap-3">{children}</div>
  </header>
);
