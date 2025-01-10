'use client';

import type * as navigation from '@/lib/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/design-system/components/ui/collapsible';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@repo/design-system/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const SidebarItem = ({
  active,
  href,
  icon: Icon,
  items,
  label,
}: navigation.SidebarPage) => {
  const pathname = usePathname();

  return (
    <Collapsible asChild defaultOpen>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className={
            !items?.length && active(pathname) ? 'bg-sidebar-accent' : ''
          }
        >
          {items?.length ? (
            <div>
              <Icon className="opacity-70" />
              <span>{label}</span>
            </div>
          ) : (
            <a href={href}>
              <Icon className="opacity-70" />
              <span>{label}</span>
            </a>
          )}
        </SidebarMenuButton>
        {items?.length ? (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight size={16} className="opacity-70" />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.label}>
                    <SidebarMenuSubButton
                      asChild
                      className={
                        subItem.active(pathname)
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }
                    >
                      <a href={subItem.href}>
                        <span>{subItem.label}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        ) : null}
      </SidebarMenuItem>
    </Collapsible>
  );
};
