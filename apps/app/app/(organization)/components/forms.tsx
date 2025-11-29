import { EververseRole } from "@repo/backend/auth";
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from "@repo/backend/auth/utils";
import { ChangelogForm } from "@/components/changelog-form";
import { CommandBar } from "@/components/command-bar";
import { ConnectForm } from "@/components/connect-form";
import { FeatureForm } from "@/components/feature-form";
import { FeedbackForm } from "@/components/feedback-form";
import { GroupForm } from "@/components/group-form";
import { InitiativeForm } from "@/components/initiative-form";
import { ProductForm } from "@/components/product-form";
import { ReleaseForm } from "@/components/release-form";
import { database } from "@/lib/database";
import { staticify } from "@/lib/staticify";

export const Forms = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    return <div />;
  }

  const [databaseOrganization, members] = await Promise.all([
    database.organization.findFirst({
      where: { id: organizationId },
      select: {
        stripeSubscriptionId: true,
        feedbackUsers: {
          orderBy: { name: "desc" },
          select: {
            id: true,
            feedbackOrganizationId: true,
            name: true,
            imageUrl: true,
            email: true,
          },
        },
        feedbackOrganizations: {
          orderBy: { name: "desc" },
          select: { id: true, name: true, domain: true },
        },
        products: {
          orderBy: { name: "desc" },
          select: { id: true, name: true, emoji: true },
        },
        groups: {
          orderBy: { name: "desc" },
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
          select: { apiKey: true },
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
        isSubscribed={Boolean(databaseOrganization.stripeSubscriptionId)}
        organizations={databaseOrganization.feedbackOrganizations}
        userEmail={user.email}
        users={databaseOrganization.feedbackUsers}
      />
      {user.user_metadata.organization_role !== EververseRole.Member && (
        <>
          <FeatureForm
            groups={databaseOrganization.groups}
            members={staticify(members)}
            products={databaseOrganization.products}
            userId={user.id}
          />
          <ProductForm />
          <GroupForm
            groups={databaseOrganization.groups}
            products={databaseOrganization.products}
          />
          <InitiativeForm members={staticify(members)} userId={user.id} />
          <ConnectForm
            githubAppInstallationId={
              databaseOrganization.githubInstallations.at(0)?.installationId
            }
            jiraAccessToken={
              databaseOrganization.atlassianInstallations.at(0)?.accessToken
            }
            linearApiKey={
              databaseOrganization.linearInstallations.at(0)?.apiKey
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
