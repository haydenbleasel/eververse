"use client";

import { Link } from "@repo/design-system/components/link";
import { cn } from "@repo/design-system/lib/utils";
import { formatDate } from "@repo/lib/format";
import { usePathname } from "next/navigation";
import type { GetFeatureResponse } from "@/actions/feature/get";
import { AvatarTooltip } from "@/components/avatar-tooltip";

type FeatureItemProperties = {
  readonly feature: GetFeatureResponse;
};

const formatFeatureDate = (startAt: Date | null, endAt: Date | null) => {
  if (!(startAt || endAt)) {
    return "Not on the roadmap";
  }

  if (startAt && endAt) {
    return `${formatDate(startAt)} - ${formatDate(endAt)}`;
  }

  if (startAt) {
    return `Starting ${formatDate(startAt)}`;
  }

  if (endAt) {
    return `Ending ${formatDate(endAt)}`;
  }

  return "Unknown";
};

export const FeatureItem = ({ feature }: FeatureItemProperties) => {
  const pathname = usePathname();
  const href = `/features/${feature.id}`;
  const active = pathname === href;

  return (
    <Link
      className={cn(
        "group relative flex gap-4 bg-transparent p-3 transition-colors hover:bg-card",
        active && "bg-card hover:bg-card/50"
      )}
      href={href}
    >
      <div>
        {feature.owner ? (
          <AvatarTooltip
            fallback={feature.owner.name?.slice(0, 2) ?? "??"}
            src={feature.owner.imageUrl}
            subtitle={feature.owner.email ?? "Unknown"}
            title={feature.owner.name ?? "Unknown"}
          />
        ) : (
          <div className="aspect-square w-6 shrink-0 self-start rounded-full bg-card" />
        )}
      </div>
      <div className="relative z-10 grid w-full gap-1">
        <div className="flex items-center justify-between gap-3 truncate">
          <p className="truncate font-medium text-foreground text-sm transition-colors">
            {feature.title}
          </p>
          <p className="shrink-0 font-medium text-muted-foreground text-sm transition-colors">
            {formatFeatureDate(feature.startAt, feature.endAt)}
          </p>
        </div>
        <p className="line-clamp-2 text-muted-foreground text-sm transition-colors">
          {feature.text}
        </p>
      </div>
    </Link>
  );
};
