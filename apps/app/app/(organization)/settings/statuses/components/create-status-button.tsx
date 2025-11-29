"use client";

import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Switch } from "@repo/design-system/components/precomposed/switch";
import { Button } from "@repo/design-system/components/ui/button";
import { Label } from "@repo/design-system/components/ui/label";
import { colors } from "@repo/design-system/lib/colors";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useId, useState } from "react";
import { createStatus } from "@/actions/feature-status/create";
import { FeatureStatusColorPicker } from "./feature-status-color-picker";

export const CreateStatusButton = () => {
  const _id = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(colors.gray);
  const [complete, setComplete] = useState(false);

  const handleSave = async () => {
    if (loading) {
      return;
    }

    try {
      const { error } = await createStatus(name, color, complete);

      if (error) {
        throw new Error(error);
      }

      setName("");
      setColor(colors.gray);
      setComplete(false);
      setOpen(false);

      window.location.reload();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      cta="Create status"
      description="A status is a way to categorize your features. For example, you can use statuses to indicate whether a feature is in development, in review, or launched."
      disabled={loading}
      onClick={handleSave}
      onOpenChange={setOpen}
      open={open}
      title="Create a new status"
      trigger={<Button variant="outline">Create status</Button>}
    >
      <div className="my-4 space-y-2">
        <Input
          autoComplete="off"
          label="Name"
          maxLength={191}
          onChangeText={setName}
          placeholder="In development"
          required
          value={name}
        />
        <div className="space-y-1.5">
          <Label htmlFor="color">Color</Label>
          <div>
            <FeatureStatusColorPicker onChange={setColor} value={color} />
          </div>
        </div>
        <Switch
          checked={complete}
          description="Features with this status are considered complete"
          label="Complete"
          onCheckedChange={setComplete}
        />
      </div>
    </Dialog>
  );
};
