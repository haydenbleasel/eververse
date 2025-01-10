import type { features } from '@/lib/features';
import { FeatureHeroInner } from './feature-hero-inner';

type FeatureHeroProperties = (typeof features)[keyof typeof features];

export const FeatureHero = ({
  icon: Icon,
  ...properties
}: FeatureHeroProperties) => (
  <FeatureHeroInner {...properties}>
    <Icon size={14} />
  </FeatureHeroInner>
);
