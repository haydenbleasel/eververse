import type { FeatureRice } from '@prisma/client';

export const impactNumberMatrix = {
  1: 0.25,
  2: 0.5,
  3: 1,
  4: 2,
  5: 3,
};

export const calculateRice = (rice: {
  reach: FeatureRice['reach'];
  impact: FeatureRice['impact'];
  confidence: FeatureRice['confidence'];
  effort: FeatureRice['effort'];
}): number =>
  Math.round(
    ((rice.confidence / 100) *
      rice.reach *
      impactNumberMatrix[rice.impact as keyof typeof impactNumberMatrix]) /
      rice.effort
  );
