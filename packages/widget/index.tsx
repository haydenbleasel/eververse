"use client";

import { cn } from "@repo/design-system/lib/utils";
import { WidgetFooter } from "./components/widget-footer";
import {
  WidgetGroup,
  type WidgetGroupProperties,
} from "./components/widget-group";

type WidgetProperties = {
  readonly changelog: {
    readonly id: string;
    readonly title: string;
    readonly createdAt: Date;
  }[];
  readonly customLinks: {
    readonly name: string;
    readonly icon: string;
    readonly link: string;
  }[];
  readonly features: {
    readonly id: string;
    readonly title: string;
  }[];
  readonly changelogUrl: string | null;
  readonly portalUrl: string | null;

  readonly enableChangelog: boolean;
  readonly enablePortal: boolean;
  readonly enableFeedback: boolean;
  readonly className?: string;
};

export const Widget = ({
  changelog,
  customLinks,
  features,
  changelogUrl,
  portalUrl,
  enableChangelog,
  enablePortal,
  enableFeedback,
  className,
}: WidgetProperties) => {
  const resources: WidgetGroupProperties["items"] = [];

  if (enableFeedback && portalUrl) {
    resources.push({
      id: "feedback",
      title: "Leave Feedback",
      link: portalUrl,
      icon: "message-circle",
    });
  }

  if (enableChangelog && changelogUrl) {
    resources.push({
      id: "changelog",
      title: "Changelog",
      link: changelogUrl,
      icon: "clock",
    });
  }

  if (enablePortal && portalUrl) {
    resources.push({
      id: "portal",
      title: "Portal",
      link: portalUrl,
      icon: "app-window",
    });
  }

  return (
    <div className={cn("h-full w-full", className)}>
      <div className="relative flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-background p-0">
        <div className="flex-1 divide-y overflow-y-auto">
          {enableChangelog && portalUrl && changelog.length > 0 ? (
            <WidgetGroup
              items={changelog.map((item) => ({
                id: item.id,
                title: item.title,
                link: new URL(`/changelog/${item.id}`, portalUrl).toString(),
                date: item.createdAt,
              }))}
              title="Recent Updates"
            />
          ) : null}
          {enablePortal && portalUrl && features.length > 0 ? (
            <WidgetGroup
              items={features.map((item) => ({
                id: item.id,
                title: item.title,
                link: new URL(item.id, portalUrl).toString(),
              }))}
              title="Upcoming Features"
            />
          ) : null}
          {customLinks.length > 0 ? (
            <WidgetGroup
              items={customLinks.map((item, index) => ({
                id: index.toString(),
                title: item.name,
                icon: item.icon,
                link: item.link,
              }))}
              title="Links"
            />
          ) : null}
          <WidgetGroup items={resources} title="Resources" />
        </div>
        <WidgetFooter />
      </div>
    </div>
  );
};
