'use client';

import { createStatus } from '@/actions/feature-status/create';
import { Dialog } from '@repo/design-system/components/precomposed/dialog';
import { Input } from '@repo/design-system/components/precomposed/input';
import { Switch } from '@repo/design-system/components/precomposed/switch';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { handleError } from '@repo/design-system/lib/handle-error';
import { tailwind } from '@repo/tailwind-config';
import { useId, useState } from 'react';
import { FeatureStatusColorPicker } from './feature-status-color-picker';

export const CreateStatusButton = () => {
  const _id = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(tailwind.theme.colors.gray[500]);
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

      setName('');
      setColor(tailwind.theme.colors.gray[500]);
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
      open={open}
      onOpenChange={setOpen}
      title="Create a new status"
      description="A status is a way to categorize your features. For example, you can use statuses to indicate whether a feature is in development, in review, or launched."
      cta="Create status"
      onClick={handleSave}
      disabled={loading}
      trigger={<Button variant="outline">Create status</Button>}
    >
      <div className="my-4 space-y-2">
        <Input
          label="Name"
          required
          value={name}
          placeholder="In development"
          onChangeText={setName}
          maxLength={191}
          autoComplete="off"
        />
        <div className="space-y-1.5">
          <Label htmlFor="color">Color</Label>
          <div>
            <FeatureStatusColorPicker value={color} onChange={setColor} />
          </div>
        </div>
        <Switch
          checked={complete}
          onCheckedChange={setComplete}
          label="Complete"
          description="Features with this status are considered complete"
        />
      </div>
    </Dialog>
  );
};
