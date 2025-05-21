'use client';

import type { User } from '@repo/backend/auth';
import { EververseRole } from '@repo/backend/auth';
import { createClient } from '@repo/backend/auth/client';
import { getUserName } from '@repo/backend/auth/format';
import type { Organization } from '@repo/backend/prisma/client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/design-system/components/ui/sidebar';
import { handleError } from '@repo/design-system/lib/handle-error';
import { cn } from '@repo/design-system/lib/utils';
import {
  ChevronsUpDown,
  LifeBuoyIcon,
  LogOut,
  StarIcon,
  UserCircleIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIntercom } from 'react-use-intercom';
import * as navigation from '../../lib/navigation';
import { SidebarItem } from './sidebar-item';

type SidebarProps = {
  readonly user: User;
  readonly organization: Organization;
};

export const Sidebar = ({ user, organization }: SidebarProps) => {
  const { show } = useIntercom();
  const router = useRouter();
  const sidebar = useSidebar();

  const handleSignOut = async () => {
    try {
      const client = await createClient();
      const response = await client.auth.signOut();

      if (response.error) {
        throw response.error;
      }

      router.push('/sign-in');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <SidebarComponent collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem
            className={cn('flex items-center gap-2', sidebar.open && 'px-2')}
          >
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-sidebar-primary">
              {organization.logoUrl && (
                <Image
                  src={organization.logoUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="object-cover"
                />
              )}
            </div>
            <div
              className={cn(
                'flex flex-col leading-none',
                !sidebar.open && 'hidden'
              )}
            >
              <span className="truncate font-medium text-sm">
                {organization.name}
              </span>
              <span className="truncate text-muted-foreground text-xs">
                @{organization.slug}
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="sr-only text-muted-foreground">
            General
          </SidebarGroupLabel>
          <SidebarMenu>
            {[navigation.home, navigation.activity, navigation.insights].map(
              (item) => (
                <SidebarItem key={item.label} {...item} />
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Plan
          </SidebarGroupLabel>
          <SidebarMenu>
            {[
              navigation.feedback,
              navigation.initiatives,
              navigation.features,
            ].map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Ship
          </SidebarGroupLabel>
          <SidebarMenu>
            {[
              navigation.roadmap,
              navigation.releases,
              navigation.changelog,
            ].map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {user.user_metadata.organization_role !== EververseRole.Member && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarItem {...navigation.data} />
                {user.user_metadata.organization_role ===
                  EververseRole.Admin && (
                  <SidebarItem {...navigation.settings} />
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.user_metadata.image_url}
                      alt={getUserName(user)}
                    />
                    <AvatarFallback className="rounded-lg">
                      {getUserName(user).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {getUserName(user)}
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.user_metadata.image_url}
                        alt={getUserName(user)}
                      />
                      <AvatarFallback className="rounded-lg">
                        {getUserName(user).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {getUserName(user)}
                      </span>
                      <span className="truncate text-muted-foreground text-xs">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <UserCircleIcon
                      className="text-muted-foreground"
                      size={16}
                    />
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <StarIcon className="text-muted-foreground" size={16} />
                    <Link href="/welcome">Getting Started</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <LifeBuoyIcon className="text-muted-foreground" size={16} />
                    <button type="button" onClick={() => show()}>
                      Support
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2">
                  <LogOut className="text-muted-foreground" size={16} />
                  <button type="button" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
};
