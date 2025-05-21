'use client';

import { updateRelease } from '@/actions/release/update';
import type { Release, release_state } from '@repo/backend/prisma/client';
import { Select } from '@repo/design-system/components/precomposed/select';
import { colors } from '@repo/design-system/lib/colors';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useState } from 'react';

type ReleaseStatePickerProperties = {
  readonly releaseId: Release['id'];
  readonly defaultValue?: Release['state'];
  readonly disabled: boolean;
};

const releaseStates: {
  value: release_state;
  label: string;
  color: string;
}[] = [
  {
    value: 'PLANNED',
    label: 'Planned',
    color: colors.gray,
  },
  {
    value: 'ACTIVE',
    label: 'Active',
    color: colors.amber,
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    color: colors.emerald,
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    color: colors.rose,
  },
];

export const ReleaseStatePicker = ({
  releaseId,
  defaultValue,
  disabled,
}: ReleaseStatePickerProperties) => {
  const [value, setValue] = useState(defaultValue);

  const handleSelect = async (newValue: string) => {
    setValue(newValue as release_state);

    try {
      const { error } = await updateRelease(releaseId, {
        state: newValue as release_state,
      });

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
      data={releaseStates.map((state) => ({
        label: state.label,
        value: state.value,
      }))}
      disabled={disabled}
      renderItem={(item) => {
        const state = releaseStates.find(({ value }) => value === item.value);

        if (!state) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: state.color }}
            />
            <span className="flex-1 truncate">{item.label}</span>
          </div>
        );
      }}
      type="state"
    />
  );
};
