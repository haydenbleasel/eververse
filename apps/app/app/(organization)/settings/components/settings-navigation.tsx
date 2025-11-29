"use client";

import { Link } from "@repo/design-system/components/link";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import {
  AppWindowIcon,
  BlocksIcon,
  CodeIcon,
  CogIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  ImportIcon,
  ListTodoIcon,
  NewspaperIcon,
  ToyBrickIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

const pages = [
  {
    icon: CogIcon,
    label: "General",
    href: "/settings",
  },
  {
    icon: UsersIcon,
    label: "Members",
    href: "/settings/members",
  },
  {
    icon: ZapIcon,
    label: "AI",
    href: "/settings/ai",
  },
  {
    icon: ListTodoIcon,
    label: "Statuses",
    href: "/settings/statuses",
  },
  {
    icon: ImportIcon,
    label: "Import",
    href: "/settings/import",
  },
  {
    icon: NewspaperIcon,
    label: "Templates",
    href: "/settings/templates",
  },
  {
    icon: ToyBrickIcon,
    label: "Integrations",
    href: "/settings/integrations",
  },
  {
    icon: AppWindowIcon,
    label: "Portal",
    href: "/settings/portal",
  },
  {
    icon: BlocksIcon,
    label: "Widget",
    href: "/settings/widget",
  },
  {
    icon: CodeIcon,
    label: "API",
    href: "/settings/api",
  },
  {
    icon: CreditCardIcon,
    label: "Subscription",
    href: "/api/stripe/portal",
  },
  /* {
   *   label: 'Notifications',
   *   href: '/settings/notifications',
   * },
   */
];

export const SettingsNavigation = () => {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/settings" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col gap-0.5 overflow-y-auto p-2.5">
      {pages.map((page) => (
        <Button
          asChild
          className={cn(
            "w-full justify-start gap-2 px-3 font-normal",
            isActive(page.href) &&
              "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
          )}
          key={page.href}
          variant="ghost"
        >
          <Link external={page.href.startsWith("/api")} href={page.href}>
            <page.icon
              className={cn(
                "shrink-0 text-muted-foreground",
                isActive(page.href) && "text-primary"
              )}
              size={16}
            />
            <span className="flex-1">{page.label}</span>
            {page.href.startsWith("/api") && (
              <ExternalLinkIcon
                className={cn(
                  "shrink-0 text-muted-foreground",
                  isActive(page.href) && "text-primary"
                )}
                size={16}
              />
            )}
          </Link>
        </Button>
      ))}
    </div>
  );
};
