import { getSlug } from '@/lib/slug';
import { database, getJsonColumnFromTable } from '@repo/backend/database';
import { Prose } from '@repo/design-system/components/prose';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FeedbackForm } from './components/feedback-form';

export const metadata: Metadata = {
  title: 'Feature',
  description: 'Vote and track the latest updates and changes to Eververse',
};

type FeatureProperties = {
  readonly params: Promise<{
    featureId: string;
  }>;
};

const Editor = dynamic(async () => {
  const component = await import(
    /* webpackChunkName: "editor" */
    '@repo/editor'
  );

  return component.Editor;
});

const Roadmap = async (props: FeatureProperties) => {
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
    'portal_feature',
    'content',
    feature.id
  );

  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-7">
        <Prose>
          <h1>{feature.title}</h1>
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: portalStatus?.color }}
            />
            <p className="m-0">{portalStatus?.name}</p>
          </div>
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

export default Roadmap;
