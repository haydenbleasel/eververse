"use client";

import type {
  FeatureConnection,
  FeatureStatus,
} from "@repo/backend/prisma/client";
import { Select } from "@repo/design-system/components/precomposed/select";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useState } from "react";
import { updateInstallationStatusMapping } from "@/actions/installation-status-mapping/update";

export const FeatureStatusConnectionPicker = ({
  connectionId,
  defaultValue,
  statuses,
}: {
  readonly connectionId: FeatureConnection["id"];
  readonly defaultValue?: FeatureStatus["id"];
  readonly statuses: {
    readonly id: FeatureStatus["id"];
    readonly name: FeatureStatus["name"];
    readonly color: FeatureStatus["color"];
  }[];
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleSelect = async (newValue: string) => {
    setValue(newValue);

    try {
      const { error } = await updateInstallationStatusMapping(connectionId, {
        featureStatusId: newValue,
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
      data={statuses.map((status) => ({
        label: status.name,
        value: status.id,
      }))}
      onChange={handleSelect}
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
      value={value}
    />
  );
};
