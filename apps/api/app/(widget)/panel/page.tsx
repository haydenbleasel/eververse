import { database } from "@repo/backend/database";
import { Widget } from "@repo/widget";
import { notFound } from "next/navigation";
import { env } from "@/env";

type WidgetPageProperties = {
  readonly searchParams?: Promise<
    Record<string, string[] | string | undefined>
  >;
};

const WidgetPage = async (props: WidgetPageProperties) => {
  const searchParams = await props.searchParams;
  const id = searchParams?.id;
  const darkMode = searchParams?.darkMode === "true";

  if (typeof id !== "string") {
    notFound();
  }

  const widget = await database.widget.findFirst({
    where: { id },
    select: {
      enableChangelog: true,
      enableFeedback: true,
      enablePortal: true,
      items: {
        select: {
          icon: true,
          link: true,
          name: true,
        },
      },
      organization: {
        select: {
          stripeSubscriptionId: true,
          portals: {
            select: {
              slug: true,
            },
          },
          changelog: {
            where: {
              status: "PUBLISHED",
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
          },
          portalFeatures: {
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
          },
        },
      },
    },
  });

  if (!widget) {
    notFound();
  }

  const portalSlug = widget.organization.portals.at(0)?.slug;
  const portalUrl = new URL("/", env.EVERVERSE_PORTAL_URL);
  portalUrl.hostname = [portalSlug, portalUrl.hostname].join(".");
  const changelogUrl = new URL("/changelog", portalUrl);

  return (
    <Widget
      changelog={widget.organization.changelog}
      changelogUrl={changelogUrl.toString()}
      className={darkMode ? "dark" : ""}
      customLinks={widget.organization.stripeSubscriptionId ? widget.items : []}
      enableChangelog={widget.enableChangelog}
      enableFeedback={widget.enableFeedback}
      enablePortal={widget.enablePortal}
      features={widget.organization.portalFeatures}
      portalUrl={portalUrl.toString()}
    />
  );
};

export default WidgetPage;
