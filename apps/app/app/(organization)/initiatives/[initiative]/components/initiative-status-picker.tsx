"use client";

import type { Initiative, initiative_state } from "@repo/backend/prisma/client";
import { Select } from "@repo/design-system/components/precomposed/select";
import { colors } from "@repo/design-system/lib/colors";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useState } from "react";
import { updateInitiative } from "@/actions/initiative/update";

type InitiativeStatusPickerProperties = {
  readonly initiativeId: Initiative["id"];
  readonly defaultValue?: Initiative["state"];
  readonly disabled: boolean;
};

const initiativeStates: {
  value: initiative_state;
  label: string;
  color: string;
}[] = [
  {
    value: "PLANNED",
    label: "Planned",
    color: colors.gray,
  },
  {
    value: "ACTIVE",
    label: "Active",
    color: colors.amber,
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: colors.emerald,
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: colors.rose,
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
      data={initiativeStates.map((state) => ({
        value: state.value,
        label: state.label,
      }))}
      disabled={disabled}
      onChange={handleSelect}
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
      type="initiative"
      value={value}
    />
  );
};
