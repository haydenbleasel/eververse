'use client';

import { Link } from '@repo/design-system/components/link';
import { cn } from '@repo/design-system/lib/utils';
import { usePathname } from 'next/navigation';

type FooterLinkProperties = {
  readonly href: string;
  readonly name: string;
};

export const FooterLink = ({ href, name }: FooterLinkProperties) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'text-foreground text-sm hover:underline',
        active && 'underline'
      )}
    >
      {name}
    </Link>
  );
};
