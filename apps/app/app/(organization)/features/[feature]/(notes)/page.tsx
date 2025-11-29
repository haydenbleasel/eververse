import { EververseRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { getJsonColumnFromTable } from "@repo/backend/database";
import { notFound } from "next/navigation";
import { database } from "@/lib/database";
import { FeatureEditor } from "./components/feature-editor";
import { FeatureTemplateSelector } from "./components/feature-template-selector";
import { FeatureTitle } from "./components/feature-title";
import type { TemplateProperties } from "./components/template";

type FeaturePageProperties = {
  readonly params: Promise<{
    readonly feature: string;
  }>;
};

export const dynamic = "force-dynamic";

const FeaturePage = async (props: FeaturePageProperties) => {
  const params = await props.params;
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    notFound();
  }

  const [feature, templates, organization] = await Promise.all([
    database.feature.findUnique({
      where: { id: params.feature },
      select: {
        title: true,
        id: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            parentGroupId: true,
          },
        },
      },
    }),
    database.template.findMany({
      select: {
        id: true,
        title: true,
        description: true,
      },
    }),
    database.organization.findUnique({
      where: { id: organizationId },
      select: {
        stripeSubscriptionId: true,
      },
    }),
  ]);

  if (!(feature && organization)) {
    notFound();
  }

  const content = await getJsonColumnFromTable(
    "feature",
    "content",
    feature.id
  );

  const templatePromises = templates.map(async (template) => {
    const content = await getJsonColumnFromTable(
      "template",
      "content",
      template.id
    );

    const newTemplate: TemplateProperties = {
      id: template.id,
      title: template.title,
      description: template.description,
      content,
    };

    return newTemplate;
  });

  const modifiedTemplates = await Promise.all(templatePromises);

  return (
    <div className="w-full px-6 py-16">
      <div className="mx-auto grid w-full max-w-prose gap-6">
        <FeatureTitle
          defaultTitle={feature.title}
          editable={
            user.user_metadata.organization_role !== EververseRole.Member
          }
          featureId={params.feature}
        />
        {content ? (
          <FeatureEditor
            defaultValue={content}
            editable={
              user.user_metadata.organization_role !== EververseRole.Member
            }
            featureId={params.feature}
          />
        ) : (
          <FeatureTemplateSelector
            featureId={params.feature}
            templates={modifiedTemplates}
          />
        )}
      </div>
    </div>
  );
};

export default FeaturePage;
