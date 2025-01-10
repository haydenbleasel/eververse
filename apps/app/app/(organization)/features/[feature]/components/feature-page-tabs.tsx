'use client';

import { Link } from '@repo/design-system/components/link';
import { Button } from '@repo/design-system/components/ui/button';
import { cn } from '@repo/design-system/lib/utils';
import { FrameIcon, NotebookIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

type FeaturePageTabsProperties = {
  readonly id: string;
};

export const FeaturePageTabs = ({ id }: FeaturePageTabsProperties) => {
  const pathname = usePathname();
  const pages = [
    {
      href: `/features/${id}`,
      text: 'Notes',
      icon: NotebookIcon,
    },
    {
      href: `/features/${id}/canvas`,
      text: 'Canvas',
      icon: FrameIcon,
    },
  ];

  return (
    <div className="flex items-center rounded-md border bg-background">
      {pages.map((page) => (
        <Button
          asChild
          variant="ghost"
          size="sm"
          key={page.href}
          className="rounded-[5px]"
        >
          <Link
            href={page.href}
            className={cn(
              'm-px flex flex-1 items-center gap-1',
              page.href === pathname
                ? 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
                : 'text-muted-foreground'
            )}
          >
            <page.icon size={14} />
            {page.text}
          </Link>
        </Button>
      ))}
    </div>
  );
};
