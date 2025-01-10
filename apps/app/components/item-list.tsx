'use client';

import { Link } from '@repo/design-system/components/link';
import { LoadingCircle } from '@repo/design-system/components/loading-circle';
import { Avatar } from '@repo/design-system/components/precomposed/avatar';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import type { FetchNextPageOptions } from '@tanstack/react-query';
import { useInView } from 'motion/react';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';

type ItemListProps = {
  data: {
    id: string;
    href: string;
    title: ReactNode;
    description?: string;
    caption?: string;
    image?: {
      src: string | undefined;
      fallback: string | undefined;
    };
  }[];
  hasNextPage: boolean;
  isFetching: boolean;
  fetchNextPage: (options?: FetchNextPageOptions) => Promise<unknown>;
};

export const ListItem = ({
  data,
}: {
  data: ItemListProps['data'][number];
}) => {
  const pathname = usePathname();
  const active = pathname === data.href;

  return (
    <Link
      href={data.href}
      className={cn(
        'group relative flex gap-4 bg-transparent p-3 transition-colors hover:bg-card',
        active &&
          'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
      )}
    >
      {data.image ? (
        <div className="relative">
          <Avatar src={data.image.src} fallback={data.image.fallback} />
        </div>
      ) : null}
      <div className="relative z-10 grid w-full gap-1">
        <div className="flex items-center justify-between gap-3 truncate">
          <p className="truncate font-medium text-sm transition-colors">
            {data.title}
          </p>
          {data.caption ? (
            <p
              className={cn(
                'shrink-0 font-medium text-muted-foreground text-sm transition-colors',
                active && 'text-primary'
              )}
            >
              {data.caption}
            </p>
          ) : null}
        </div>
        <p
          className={cn(
            'line-clamp-2 text-muted-foreground text-sm transition-colors',
            active && 'text-primary'
          )}
        >
          {data.description}
        </p>
      </div>
    </Link>
  );
};

export const ItemList = ({
  data,
  hasNextPage,
  isFetching,
  fetchNextPage,
}: ItemListProps) => {
  const [visible, setVisible] = useState(false);
  const listReference = useRef<HTMLDivElement>(null);
  const inView = useInView(listReference, {});

  useEffect(() => {
    if (isFetching) {
      return;
    }

    if (visible) {
      fetchNextPage()
        .then(() => setVisible(false))
        .catch(handleError);
    } else if (inView) {
      setVisible(true);
    }
  }, [inView, fetchNextPage, visible, isFetching]);

  return (
    <div className="divide-y">
      {data.map((data) => (
        <ListItem key={data.id} data={data} />
      ))}
      {hasNextPage ? (
        <div
          ref={listReference}
          className="flex w-full items-center justify-center p-3"
        >
          <LoadingCircle />
        </div>
      ) : null}
    </div>
  );
};
