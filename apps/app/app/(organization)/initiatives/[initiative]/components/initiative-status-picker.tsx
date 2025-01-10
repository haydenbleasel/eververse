'use client';

import { updateInitiative } from '@/actions/initiative/update';
import type { Initiative, initiative_state } from '@prisma/client';
import { Select } from '@repo/design-system/components/precomposed/select';
import { handleError } from '@repo/design-system/lib/handle-error';
import { tailwind } from '@repo/tailwind-config';
import { useState } from 'react';

type InitiativeStatusPickerProperties = {
  readonly initiativeId: Initiative['id'];
  readonly defaultValue?: Initiative['state'];
  readonly disabled: boolean;
};

const initiativeStates: {
  value: initiative_state;
  label: string;
  color: string;
}[] = [
  {
    value: 'PLANNED',
    label: 'Planned',
    color: tailwind.theme.colors.gray[200],
  },
  {
    value: 'ACTIVE',
    label: 'Active',
    color: tailwind.theme.colors.amber[500],
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    color: tailwind.theme.colors.emerald[500],
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    color: tailwind.theme.colors.rose[500],
  },
];

export const InitiativeStatusPicker = ({
  initiativeId,
  defaultValue,
  disabled,
}: InitiativeStatusPickerProperties) => {
  const [value, setValue] = useState(defaultValue ?? undefined);

  const handleSelect = async (newValue: string) => {
    setValue(newValue as initiative_state);

    try {
      const { error } = await updateInitiative(initiativeId, {
        state: newValue as initiative_state,
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
      data={initiativeStates.map((state) => ({
        value: state.value,
        label: state.label,
      }))}
      disabled={disabled}
      type="initiative"
      renderItem={(item) => {
        const state = initiativeStates.find(
          ({ value }) => value === item.value
        );

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
    />
  );
};
