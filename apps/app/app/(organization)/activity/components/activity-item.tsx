import { intlFormatDistance } from "date-fns";
import type { BlocksIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { AvatarTooltip } from "@/components/avatar-tooltip";

type ActivityItemProperties = {
  readonly data: {
    readonly id: string;
    readonly children: ReactNode;
    readonly createdAt: Date;
    readonly userImage: string | undefined;
    readonly userName: string | null | undefined;
    readonly userIdentifier: string | null | undefined;
    readonly icon: string | typeof BlocksIcon;
  };
};

export const ActivityItem = ({ data }: ActivityItemProperties) => (
  <div className="flex items-center justify-between gap-3" key={data.id}>
    {typeof data.icon === "string" ? (
      <Image
        alt=""
        className="mt-0 mb-0"
        height={24}
        src={data.icon}
        width={24}
      />
    ) : (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
        <data.icon size={12} />
      </div>
    )}
    <p className="mt-0 mb-0 flex-1 truncate text-sm">{data.children}</p>
    <p className="mt-0 mb-0 shrink-0 whitespace-nowrap text-muted-foreground text-sm">
      {intlFormatDistance(data.createdAt, new Date(), { style: "narrow" })}
    </p>
    <div className="shrink-0">
      <AvatarTooltip
        fallback={data.userName?.slice(0, 2) ?? "??"}
        src={data.userImage}
        subtitle={data.userIdentifier ?? ""}
        title={data.userName ?? ""}
      />
    </div>
  </div>
);
