"use client";

import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type ChangelogLinkProps = {
  id: string;
  children: ReactNode;
};

export const ChangelogLink = ({ id, children }: ChangelogLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(`/changelog/${id}`);

  return (
    <Link
      className={cn(
        "text-muted-foreground text-sm",
        isActive && "font-medium text-foreground"
      )}
      href={`/changelog/${id}`}
    >
      {children}
    </Link>
  );
};
