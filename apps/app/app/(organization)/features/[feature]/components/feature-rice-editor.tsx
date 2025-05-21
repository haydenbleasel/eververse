'use client';

import { updateRice } from '@/actions/feature-rice/update';
import { impactNumberMatrix } from '@/lib/rice';
import type {
  AiFeatureRice,
  Feature,
  FeatureRice,
} from '@repo/backend/prisma/client';
import { Select } from '@repo/design-system/components/precomposed/select';
import { Slider } from '@repo/design-system/components/ui/slider';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useState } from 'react';
import { FeatureRiceInput } from './feature-rice-input';
import { FeatureRicePopover } from './feature-rice-popover';

type FeatureRiceEditorProperties = {
  readonly featureId: Feature['id'];
  readonly rice: Pick<
    FeatureRice,
    'confidence' | 'effort' | 'impact' | 'reach'
  > | null;
  readonly aiRice: Pick<
    AiFeatureRice,
    | 'confidence'
    | 'confidenceReason'
    | 'effort'
    | 'effortReason'
    | 'impact'
    | 'impactReason'
    | 'reach'
    | 'reachReason'
  > | null;
  readonly disabled: boolean;
};

const impacts = [
  {
    label: 'Minimal',
    value: 1,
  },
  {
    label: 'Low',
    value: 2,
  },
  {
    label: 'Medium',
    value: 3,
  },
  {
    label: 'High',
    value: 4,
  },
  {
    label: 'Massive',
    value: 5,
  },
];

export const FeatureRiceEditor = ({
  featureId,
  rice,
  aiRice,
  disabled,
}: FeatureRiceEditorProperties) => {
  const [reach, setReach] = useState<FeatureRice['reach']>(
    rice?.reach ?? aiRice?.reach ?? 1
  );
  const [impact, setImpact] = useState<FeatureRice['impact']>(
    rice?.impact ?? aiRice?.impact ?? 1
  );
  const [confidence, setConfidence] = useState<FeatureRice['confidence']>(
    rice?.confidence ?? aiRice?.confidence ?? 0
  );
  const [effort, setEffort] = useState<FeatureRice['effort']>(
    rice?.effort ?? aiRice?.effort ?? 1
  );

  const handleUpdateRice = async () => {
    try {
      await updateRice({
        featureId,
        reach,
        impact,
        confidence,
        effort,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const handleSetReach = async (value: number) => {
    setReach(value);
    await handleUpdateRice();
  };

  const handleSetImpact = async (value: string) => {
    setImpact(Number.parseInt(value, 10));
    await handleUpdateRice();
  };

  const handleSetConfidence = async (value: number[]) => {
    setConfidence(value[0]);
    await handleUpdateRice();
  };

  const handleSetEffort = async (value: number) => {
    setEffort(value);
    await handleUpdateRice();
  };

  const inputs = [
    {
      label: 'Reach',
      description: 'The number of users impacted by this feature.',
      value: reach,
      reason: aiRice?.reachReason,
      children: <FeatureRiceInput value={reach} onChange={handleSetReach} />,
    },
    {
      label: 'Impact',
      description: 'The relative impact this feature will have on users.',
      value: impactNumberMatrix[impact as keyof typeof impactNumberMatrix],
      reason: aiRice?.impactReason,
      children: (
        <Select
          value={`${impact}`}
          onChange={handleSetImpact}
          data={impacts.map((item) => ({
            value: `${item.value}`,
            label: item.label,
          }))}
          renderItem={(item) => (
            <div className="flex items-center gap-2">
              <p className="block text-foreground">{item.label}</p>
              <p className="block text-muted-foreground">
                &times;
                {
                  impactNumberMatrix[
                    Number(item.value) as keyof typeof impactNumberMatrix
                  ]
                }
              </p>
            </div>
          )}
          type="impact"
        />
      ),
    },
    {
      label: 'Confidence',
      description: 'The level of confidence in the RICE score.',
      value: `${confidence}%`,
      reason: aiRice?.confidenceReason,
      children: (
        <Slider
          defaultValue={[confidence]}
          onValueCommit={handleSetConfidence}
        />
      ),
    },
    {
      label: 'Effort',
      description:
        'The amount of work required to complete this feature, usually in person-months.',
      value: effort,
      reason: aiRice?.effortReason,
      children: <FeatureRiceInput value={effort} onChange={handleSetEffort} />,
    },
  ];

  return (
    <div className="flex">
      {inputs.map((item, index) => (
        <FeatureRicePopover
          key={item.label}
          item={item}
          index={index}
          disabled={disabled}
          className={aiRice && !rice ? 'text-primary' : ''}
        />
      ))}
    </div>
  );
};
