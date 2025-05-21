'use client';

import type { Template as TemplateClass } from '@repo/backend/prisma/client';
import { cn } from '@repo/design-system/lib/utils';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

export type TemplateProperties = Pick<
  TemplateClass,
  'description' | 'id' | 'title' | 'content'
>;

const Editor = dynamic(
  async () => {
    const Module = await import(
      /* webpackChunkName: "editor" */
      '@/components/editor'
    );

    return Module.Editor;
  },
  {
    ssr: false,
  }
);

export const Template = ({
  title,
  description,
  content,
  active,
  className,
  children,
}: TemplateProperties & {
  readonly active: boolean;
  readonly className?: string;
  readonly children?: ReactNode;
}) => (
  <div
    className={cn(
      'flex aspect-[2/3] w-full flex-col divide-y overflow-hidden rounded-md border bg-background transition-colors',
      !children && 'hover:bg-card',
      active &&
        'border-transparent ring-2 ring-violet-500 dark:ring-violet-400',
      className
    )}
  >
    <div className="flex-1 overflow-hidden p-3">
      <div className="origin-top scale-50">
        <div className="-ml-[50%] h-[200%] w-[200%]">
          <Editor defaultValue={content as object} editable={false} />
        </div>
      </div>
    </div>
    <div className="flex shrink-0 items-start justify-between gap-4 p-3">
      <div>
        <p className="m-0 truncate text-foreground text-sm">{title}</p>
        <p className="m-0 truncate text-muted-foreground text-sm">
          {description}
        </p>
      </div>
      {children}
    </div>
  </div>
);
