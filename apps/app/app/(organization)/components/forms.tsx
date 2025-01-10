import { ChangelogForm } from '@/components/changelog-form';
import { CommandBar } from '@/components/command-bar';
import { ConnectForm } from '@/components/connect-form';
import { FeatureForm } from '@/components/feature-form';
import { FeedbackForm } from '@/components/feedback-form';
import { GroupForm } from '@/components/group-form';
import { InitiativeForm } from '@/components/initiative-form';
import { ProductForm } from '@/components/product-form';
import { ReleaseForm } from '@/components/release-form';
import { database } from '@/lib/database';
import { staticify } from '@/lib/staticify';
import { EververseRole } from '@repo/backend/auth';
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from '@repo/backend/auth/utils';

export const Forms = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!user || !organizationId) {
    return <div />;
  }

  const [databaseOrganization, members] = await Promise.all([
    database.organization.findFirst({
      where: { id: organizationId },
      select: {
        stripeSubscriptionId: true,
        feedbackUsers: {
          orderBy: { name: 'desc' },
          select: {
            id: true,
            feedbackOrganizationId: true,
            name: true,
            imageUrl: true,
            email: true,
          },
        },
        feedbackOrganizations: {
          orderBy: { name: 'desc' },
          select: { id: true, name: true, domain: true },
        },
        products: {
          orderBy: { name: 'desc' },
          select: { id: true, name: true, emoji: true },
        },
        groups: {
          orderBy: { name: 'desc' },
          select: {
            id: true,
            name: true,
            productId: true,
            parentGroupId: true,
            emoji: true,
          },
        },
        githubInstallations: {
          select: { installationId: true },
          take: 1,
        },
        linearInstallations: {
          select: { accessToken: true },
          take: 1,
        },
        atlassianInstallations: {
          select: { accessToken: true },
          take: 1,
        },
      },
    }),
    currentMembers(),
  ]);

  if (!databaseOrganization) {
    return <div />;
  }

  return (
    <>
      <FeedbackForm
        userEmail={user.email}
        users={databaseOrganization.feedbackUsers}
        organizations={databaseOrganization.feedbackOrganizations}
        isSubscribed={Boolean(databaseOrganization.stripeSubscriptionId)}
      />
      {user.user_metadata.organization_role !== EververseRole.Member && (
        <>
          <FeatureForm
            userId={user.id}
            members={staticify(members)}
            products={databaseOrganization.products}
            groups={databaseOrganization.groups}
          />
          <ProductForm />
          <GroupForm
            products={databaseOrganization.products}
            groups={databaseOrganization.groups}
          />
          <InitiativeForm userId={user.id} members={staticify(members)} />
          <ConnectForm
            githubAppInstallationId={
              databaseOrganization.githubInstallations.at(0)?.installationId
            }
            linearAccessToken={
              databaseOrganization.linearInstallations.at(0)?.accessToken
            }
            jiraAccessToken={
              databaseOrganization.atlassianInstallations.at(0)?.accessToken
            }
          />
          <ChangelogForm />
          <ReleaseForm />
          <CommandBar hasProducts={databaseOrganization.products.length > 0} />
        </>
      )}
    </>
  );
};
