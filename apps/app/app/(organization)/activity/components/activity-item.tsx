import { AvatarTooltip } from '@/components/avatar-tooltip';
import { Prose } from '@repo/design-system/components/prose';
import { intlFormatDistance } from 'date-fns';
import type { BlocksIcon } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

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
  <Prose key={data.id} className="flex items-center justify-between gap-3">
    {typeof data.icon === 'string' ? (
      <Image
        src={data.icon}
        alt=""
        width={24}
        height={24}
        className="mt-0 mb-0"
      />
    ) : (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-card text-muted-foreground">
        <data.icon size={12} />
      </div>
    )}
    <p className="mt-0 mb-0 flex-1 truncate font-medium">{data.children}</p>
    <p className="mt-0 mb-0 shrink-0 whitespace-nowrap text-muted-foreground text-sm">
      {intlFormatDistance(data.createdAt, new Date(), { style: 'narrow' })}
    </p>
    <div className="not-prose shrink-0">
      <AvatarTooltip
        src={data.userImage}
        fallback={data.userName?.slice(0, 2) ?? '??'}
        title={data.userName ?? ''}
        subtitle={data.userIdentifier ?? ''}
      />
    </div>
  </Prose>
);
