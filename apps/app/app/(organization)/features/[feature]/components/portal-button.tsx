import { database } from '@/lib/database';
import { getPortalUrl } from '@/lib/portal';
import type { Feature, PortalFeature } from '@prisma/client';
import { EververseRole } from '@repo/backend/auth';
import { currentOrganizationId, currentUser } from '@repo/backend/auth/utils';
import { getJsonColumnFromTable } from '@repo/backend/database';
import { Link } from '@repo/design-system/components/link';
import { Button } from '@repo/design-system/components/ui/button';
import { textToContent } from '@repo/editor/lib/tiptap';
import { notFound } from 'next/navigation';
import { FeaturePortalButton } from './feature-portal-button';

type PortalButtonProperties = {
  readonly featureId: Feature['id'];
  readonly portalFeatureId: PortalFeature['id'] | undefined;
};

export const PortalButton = async ({
  featureId,
  portalFeatureId,
}: PortalButtonProperties) => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    notFound();
  }

  const [portal, feature, portalFeature, organization] = await Promise.all([
    database.portal.findFirst({
      select: { id: true },
    }),
    database.feature.findUnique({
      where: { id: featureId },
      select: {
        title: true,
        id: true,
      },
    }),
    database.portalFeature.findFirst({
      where: { id: portalFeatureId },
      select: {
        title: true,
        id: true,
      },
    }),
    database.organization.findUnique({
      where: { id: organizationId },
      select: { slug: true },
    }),
  ]);

  if (!feature || !organization) {
    notFound();
  }

  if (!portal && user.user_metadata.organization_role !== EververseRole.Admin) {
    return <div />;
  }

  if (!portal) {
    return (
      <Button asChild variant="outline">
        <Link href="/portal">Create a portal</Link>
      </Button>
    );
  }

  if (portalFeatureId) {
    const url = await getPortalUrl(portalFeatureId);

    if (!portalFeature) {
      return <div />;
    }

    const content = await getJsonColumnFromTable(
      'portal_feature',
      'content',
      portalFeature.id
    );

    return (
      <>
        <Button asChild variant="outline">
          <Link href={url} aria-label="Portal">
            View in portal
          </Link>
        </Button>
        <FeaturePortalButton
          featureId={featureId}
          portalFeatureId={portalFeatureId}
          defaultTitle={portalFeature.title}
          defaultContent={content ?? textToContent('')}
          variant="link"
        />
      </>
    );
  }

  const content = await getJsonColumnFromTable(
    'feature',
    'content',
    feature.id
  );

  if (user.user_metadata.organization_role !== EververseRole.Member) {
    return (
      <FeaturePortalButton
        defaultTitle={feature.title}
        defaultContent={content ?? textToContent('')}
        featureId={featureId}
        variant="outline"
      />
    );
  }

  return <div />;
};
