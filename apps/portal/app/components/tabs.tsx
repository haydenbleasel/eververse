'use client';

import { Link } from '@repo/design-system/components/link';
import { cn } from '@repo/design-system/lib/utils';
import { ListIcon, MapIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    icon: MapIcon,
    label: 'Roadmap',
    href: '/',
  },
  {
    icon: ListIcon,
    label: 'Changelog',
    href: '/changelog',
  },
];

export const Tabs = () => {
  const pathname = usePathname();

  return (
    <div className="-mb-px flex items-center gap-4">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className={cn(
            'flex items-center gap-2 border-b py-3 font-medium text-sm',
            pathname === tab.href
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground'
          )}
        >
          <tab.icon size={16} />
          {tab.label}
        </Link>
      ))}
    </div>
  );
};
