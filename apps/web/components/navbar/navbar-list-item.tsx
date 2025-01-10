import { NavigationMenuLink } from '@repo/design-system/components/ui/navigation-menu';
import { cn } from '@repo/design-system/lib/utils';
import { ExternalLinkIcon } from 'lucide-react';
import type { PlusIcon } from 'lucide-react';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ElementRef } from 'react';

export const NavbarListItem = forwardRef<
  ElementRef<'a'>,
  ComponentPropsWithoutRef<'a'> & {
    readonly icon?: typeof PlusIcon;
  }
>(({ className, title, children, icon: Icon, ...properties }, reference) => (
  <li>
    <NavigationMenuLink asChild>
      <a
        ref={reference}
        className={cn(
          'flex select-none items-start gap-4 rounded p-3 leading-none no-underline outline-none transition-colors',
          'hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground',
          className
        )}
        {...properties}
      >
        {Icon ? <Icon size={20} className="shrink-0" /> : null}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="font-medium leading-none">{title}</div>
            {properties.href?.includes('http') ? (
              <ExternalLinkIcon size={14} className="text-muted-foreground" />
            ) : null}
          </div>
          <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">
            {children}
          </p>
        </div>
      </a>
    </NavigationMenuLink>
  </li>
));
NavbarListItem.displayName = 'NavbarListItem';
