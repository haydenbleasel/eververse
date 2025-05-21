import { database } from '@/lib/database';
import { getPortalUrl } from '@/lib/portal';
import { currentOrganizationId } from '@repo/backend/auth/utils';
import type { Widget as WidgetType } from '@repo/backend/prisma/client';
import dynamic from 'next/dynamic';

type WidgetPreviewProperties = {
  readonly data: WidgetType;
};

const Widget = dynamic(async () => {
  const component = await import(
    /* webpackChunkName: "widget" */
    '@repo/widget'
  );

  return component.Widget;
});

export const WidgetPreview = async ({ data }: WidgetPreviewProperties) => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const [changelog, customLinks, features] = await Promise.all([
    database.changelog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    database.widgetItem.findMany({
      where: { widgetId: data.id },
      include: {
        organization: {
          select: {
            stripeSubscriptionId: true,
          },
        },
      },
    }),
    database.portalFeature.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  let portalUrl = '';

  try {
    portalUrl = await getPortalUrl();
  } catch (_error) {}

  const changelogUrl = portalUrl
    ? new URL('/changelog', portalUrl).toString()
    : null;

  return (
    <div className="h-[60dvh] w-full max-w-sm overflow-hidden rounded-2xl shadow-sm">
      <Widget
        changelog={changelog}
        customLinks={
          customLinks.some((link) => link.organization.stripeSubscriptionId)
            ? customLinks
            : []
        }
        features={features}
        portalUrl={portalUrl}
        changelogUrl={changelogUrl}
        enableChangelog={data.enableChangelog}
        enablePortal={data.enablePortal}
        enableFeedback={data.enableFeedback}
      />
    </div>
  );
};
