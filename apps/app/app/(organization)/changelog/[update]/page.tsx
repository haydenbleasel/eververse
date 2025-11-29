import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { getJsonColumnFromTable } from "@repo/backend/database";
import { contentToText } from "@repo/editor/lib/tiptap";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { database } from "@/lib/database";
import { ChangelogEditor } from "./components/changelog-editor";
import { ChangelogSidebar } from "./components/changelog-sidebar";
import { ChangelogTitle } from "./components/changelog-title";
import { UpdateEmptyState } from "./components/update-empty-state";

type ChangelogPageProperties = {
  readonly params: Promise<{
    readonly update: string;
  }>;
};

export const dynamic = "force-dynamic";

export const generateMetadata = async (
  props: ChangelogPageProperties
): Promise<Metadata> => {
  const params = await props.params;
  const changelog = await database.changelog.findUnique({
    where: { id: params.update },
    select: {
      id: true,
      title: true,
    },
  });

  if (!changelog) {
    return {};
  }

  const content = await getJsonColumnFromTable(
    "changelog",
    "content",
    changelog.id
  );
  const text = content ? contentToText(content) : "No content yet.";

  return createMetadata({
    title: changelog.title,
    description: text.slice(0, 150),
  });
};

const ChangelogPage = async (props: ChangelogPageProperties) => {
  const params = await props.params;
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    notFound();
  }

  const [changelog, organization] = await Promise.all([
    database.changelog.findUnique({
      where: { id: params.update },
      select: {
        id: true,
        title: true,
      },
    }),
    database.organization.findUnique({
      where: { id: organizationId },
      select: { stripeSubscriptionId: true },
    }),
  ]);

  if (!(changelog && organization)) {
    notFound();
  }

  const content = await getJsonColumnFromTable(
    "changelog",
    "content",
    changelog.id
  );

  return (
    <div className="flex h-full divide-x">
      <div className="w-full px-6 py-16">
        <div className="mx-auto grid w-full max-w-prose gap-6">
          <ChangelogTitle
            changelogId={changelog.id}
            defaultTitle={changelog.title}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
          />
          {content ? (
            <ChangelogEditor
              changelogId={changelog.id}
              defaultValue={content}
              editable={
                user.user_metadata.organization_role !== EververseRole.Member
              }
            />
          ) : (
            <UpdateEmptyState
              changelogId={changelog.id}
              isSubscribed={Boolean(organization.stripeSubscriptionId)}
            />
          )}
        </div>
      </div>
      <ChangelogSidebar changelogId={params.update} />
    </div>
  );
};

export default ChangelogPage;
