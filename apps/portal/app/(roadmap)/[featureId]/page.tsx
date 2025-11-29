import { database, getJsonColumnFromTable } from "@repo/backend/database";
import { Prose } from "@repo/design-system/components/prose";
import { Badge } from "@repo/design-system/components/ui/badge";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getSlug } from "@/lib/slug";
import { FeedbackForm } from "./components/feedback-form";

export const metadata: Metadata = {
  title: "Feature",
  description: "Vote and track the latest updates and changes to Eververse",
};

type FeatureProperties = {
  readonly params: Promise<{
    featureId: string;
  }>;
};

const Editor = dynamic(async () => {
  const component = await import(
    /* webpackChunkName: "editor" */
    "@repo/editor"
  );

  return component.Editor;
});

const FeaturePage = async (props: FeatureProperties) => {
  console.log("Feature ID page");
  const params = await props.params;
  const slug = await getSlug();
  const { featureId } = params;

  if (!slug) {
    notFound();
  }

  const feature = await database.portalFeature.findFirst({
    where: {
      id: featureId,
      portal: {
        slug,
      },
    },
    select: {
      id: true,
      title: true,
      feature: {
        select: {
          status: {
            select: {
              id: true,
              portalStatusMapping: {
                select: {
                  portalStatus: {
                    select: {
                      name: true,
                      color: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!feature) {
    notFound();
  }

  const portalStatus =
    feature.feature.status.portalStatusMapping.at(0)?.portalStatus;

  const content = await getJsonColumnFromTable(
    "portal_feature",
    "content",
    feature.id
  );

  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-7">
        <h1 className="m-0 font-semibold text-4xl tracking-tight">
          {feature.title}
        </h1>
        <Badge className="my-6 text-sm" variant="secondary">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: portalStatus?.color }}
          />
          <p className="m-0">{portalStatus?.name}</p>
        </Badge>
        <Prose>
          {content ? (
            <div className="mt-8">
              <Editor defaultValue={content} editable={false} />
            </div>
          ) : null}
        </Prose>
      </div>
      <div className="md:col-span-4 md:col-start-9">
        <FeedbackForm featureId={featureId} slug={slug} />
      </div>
    </div>
  );
};

export default FeaturePage;
