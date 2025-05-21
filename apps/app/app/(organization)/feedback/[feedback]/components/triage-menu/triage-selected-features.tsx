import { CheckIcon } from 'lucide-react';

import type { Feature, FeatureStatus } from '@repo/backend/prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';

type TriageSelectedFeaturesProperties = {
  readonly features: (Pick<Feature, 'id' | 'title'> & {
    readonly status: Pick<FeatureStatus, 'color'>;
  })[];
  readonly onSelect: (id: string) => void;
  readonly value: string[];
};

export const TriageSelectedFeatures = ({
  features,
  onSelect,
  value,
}: TriageSelectedFeaturesProperties) => (
  <div className="space-y-1.5 p-3">
    <Label htmlFor="triage-menu">Selected features</Label>
    <div>
      {features
        .filter((feature) => value.includes(feature.id))
        .map((feature) => (
          <Button
            key={feature.id}
            variant="ghost"
            className="flex h-auto w-full items-center gap-2 px-2 py-1.5 text-left font-normal text-sm"
            onClick={() => onSelect(feature.id)}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: feature.status.color }}
            />
            <span className="flex-1 truncate">{feature.title}</span>
            <CheckIcon className="h-4 w-4 shrink-0" />
          </Button>
        ))}
    </div>
  </div>
);
