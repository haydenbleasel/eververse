'use client';

import { updateFeature } from '@/actions/feature/update';
import type { Feature, Group } from '@repo/backend/prisma/client';
import { Emoji } from '@repo/design-system/components/emoji';
import { Select } from '@repo/design-system/components/precomposed/select';
import { handleError } from '@repo/design-system/lib/handle-error';
import { toast } from '@repo/design-system/lib/toast';
import { useState } from 'react';

type FeatureGroupPickerProperties = {
  readonly featureId: Feature['id'];
  readonly defaultValue: string | undefined;
  readonly disabled: boolean;
  readonly data: Pick<Group, 'id' | 'name' | 'emoji'>[];
};

export const FeatureGroupPicker = ({
  featureId,
  defaultValue,
  disabled,
  data,
}: FeatureGroupPickerProperties) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const handleSelect = async (newValue: string) => {
    if (newValue === value || loading) {
      return;
    }

    setValue(newValue);
    setLoading(true);

    try {
      const { error } = await updateFeature(featureId, { groupId: newValue });

      if (error) {
        throw new Error(error);
      }

      toast.success('Group updated');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={value}
      onChange={handleSelect}
      data={data.map((group) => ({
        label: group.name,
        value: group.id,
      }))}
      disabled={disabled || loading}
      renderItem={(item) => {
        const group = data.find((group) => group.id === item.value);

        if (!group) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <Emoji id={group.emoji} size="0.825rem" />
            <span className="flex-1 truncate">{item.label}</span>
          </div>
        );
      }}
      type="group"
    />
  );
};
