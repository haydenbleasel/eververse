'use client';

import { updateFeature } from '@/actions/feature/update';
import type { Feature, FeatureStatus } from '@repo/backend/prisma/client';
import { Select } from '@repo/design-system/components/precomposed/select';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useState } from 'react';

type FeatureStatusPickerProperties = {
  readonly featureId: Feature['id'];
  readonly defaultValue?: FeatureStatus['id'];
  readonly statuses: Pick<FeatureStatus, 'color' | 'id' | 'name'>[];
  readonly disabled: boolean;
};

export const FeatureStatusPicker = ({
  featureId,
  defaultValue,
  statuses,
  disabled,
}: FeatureStatusPickerProperties) => {
  const [value, setValue] = useState(defaultValue);
  const handleSelect = async (newValue: string) => {
    setValue(newValue);

    try {
      const { error } = await updateFeature(featureId, { statusId: newValue });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Select
      value={value}
      onChange={handleSelect}
      data={statuses.map((status) => ({
        label: status.name,
        value: status.id,
      }))}
      disabled={disabled}
      renderItem={(item) => {
        const status = statuses.find(({ id }) => id === item.value);

        if (!status) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: status.color }}
            />
            <span className="flex-1 truncate">{status.name}</span>
          </div>
        );
      }}
      type="status"
    />
  );
};
