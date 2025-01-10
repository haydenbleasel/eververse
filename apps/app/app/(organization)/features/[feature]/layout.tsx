import { database } from '@/lib/database';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { FeatureSidebar } from './components/feature-sidebar';

type FeaturePageLayoutProperties = {
  readonly params: Promise<{
    readonly feature: string;
  }>;
  readonly children: ReactNode;
};

export const generateMetadata = async (
  props: FeaturePageLayoutProperties
): Promise<Metadata> => {
  const params = await props.params;
  const feature = await database.feature.findUnique({
    where: { id: params.feature },
    select: { title: true },
  });

  if (!feature) {
    return {};
  }

  return createMetadata({
    title: feature.title,
    description: `Feature page for ${feature.title}`,
  });
};

const FeaturePageLayout = async (props: FeaturePageLayoutProperties) => {
  const params = await props.params;

  const { children } = props;

  return (
    <div className="flex h-full divide-x">
      {children}
      <FeatureSidebar featureId={params.feature} />
    </div>
  );
};

export default FeaturePageLayout;
