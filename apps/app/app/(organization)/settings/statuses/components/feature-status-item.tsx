"use client";

import type { Feature, FeatureStatus } from "@repo/backend/prisma/client";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Switch } from "@repo/design-system/components/precomposed/switch";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { GripVerticalIcon } from "lucide-react";
import { useState } from "react";
import { deleteStatus } from "@/actions/feature-status/delete";
import { updateStatus } from "@/actions/feature-status/update";
import { FeatureStatusColorPicker } from "./feature-status-color-picker";
import { FeatureStatusDropdown } from "./feature-status-dropdown";

type FeatureStatusItemProperties = {
  readonly data: Pick<FeatureStatus, "color" | "complete" | "id" | "name"> & {
    readonly features: Pick<Feature, "id">[];
  };
  readonly statuses: Pick<FeatureStatus, "color" | "id" | "name">[];
};

export const FeatureStatusItem = ({
  data,
  statuses,
}: FeatureStatusItemProperties) => {
  const [complete, setComplete] = useState(data.complete);
  const [name, setName] = useState(data.name);
  const [activeColor, setActiveColor] = useState(data.color);

  const handleColorChange = async (newColor: FeatureStatus["color"]) => {
    setActiveColor(newColor);
    const oldColor = data.color;

    try {
      const { error } = await updateStatus(data.id, { color: newColor });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
      setActiveColor(oldColor);
    }
  };

  const handleUpdateName = async () => {
    try {
      const { error } = await updateStatus(data.id, { name });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleCompleteChange = async (newComplete: boolean) => {
    setComplete(newComplete);
    const oldComplete = data.complete;

    try {
      const { error } = await updateStatus(data.id, { complete: newComplete });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
      setComplete(oldComplete);
    }
  };

  const handleDelete = async (mergeDestinationId: FeatureStatus["id"]) => {
    try {
      const { error } = await deleteStatus(data.id, mergeDestinationId);

      if (error) {
        throw new Error(error);
      }

      toast.success(
        "Status deleted successfully. The relevant features have been migrated to the new status."
      );

      window.location.reload();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div
      className="grid grid-cols-12 items-center gap-8 bg-background px-4 py-3"
      key={data.id}
    >
      <div className="col-span-4 flex items-center gap-3">
        <GripVerticalIcon className="text-muted-foreground" size={16} />
        <Input
          autoComplete="off"
          className="bg-background"
          defaultValue={name}
          maxLength={191}
          onBlur={handleUpdateName}
          onChangeText={setName}
        />
      </div>
      <div className="col-span-3">
        <FeatureStatusColorPicker
          onChange={handleColorChange}
          value={activeColor}
        />
      </div>
      <div className="col-span-2">
        <Switch checked={complete} onCheckedChange={handleCompleteChange} />
      </div>
      <div className="col-span-2 font-medium text-sm">
        {data.features.length}
      </div>
      <div className="text-right">
        <FeatureStatusDropdown
          onDelete={handleDelete}
          status={data}
          statuses={statuses}
        />
      </div>
    </div>
  );
};
