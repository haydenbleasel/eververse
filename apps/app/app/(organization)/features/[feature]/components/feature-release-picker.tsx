"use client";

import type { Feature, Release } from "@repo/backend/prisma/client";
import { Select } from "@repo/design-system/components/precomposed/select";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useState } from "react";
import { updateFeature } from "@/actions/feature/update";

type FeatureReleasePickerProperties = {
  readonly featureId: Feature["id"];
  readonly defaultValue?: Feature["releaseId"] | null;
  readonly releases: Pick<Release, "id" | "title">[];
  readonly disabled: boolean;
};

export const FeatureReleasePicker = ({
  featureId,
  defaultValue,
  releases,
  disabled,
}: FeatureReleasePickerProperties) => {
  const [value, setValue] = useState(defaultValue ?? undefined);

  const handleSelect = async (newValue: string) => {
    setValue(newValue);

    try {
      const { error } = await updateFeature(featureId, { releaseId: newValue });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Select
      data={releases.map((release) => ({
        label: release.title,
        value: release.id,
      }))}
      disabled={disabled}
      onChange={handleSelect}
      type="release"
      value={value}
    />
  );
};
