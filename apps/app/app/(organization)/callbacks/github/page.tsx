import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { database } from "@/lib/database";

export const metadata: Metadata = createMetadata({
  title: "Processing",
  description: "Please wait while we process your request.",
});

type GitHubCallbackPageProperties = {
  readonly searchParams: Promise<Record<string, string>>;
};

const GitHubCallbackPage = async (props: GitHubCallbackPageProperties) => {
  const searchParams = await props.searchParams;
  const installationId = searchParams.installation_id;

  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId && installationId)) {
    notFound();
  }

  const installation = await database.gitHubInstallation.create({
    data: {
      installationId,
      organizationId,
      creatorId: user.id,
    },
    select: {
      id: true,
      organization: {
        select: {
          slug: true,
        },
      },
    },
  });

  return redirect(`/${installation.organization.slug}/settings/integrations`);
};

export default GitHubCallbackPage;
