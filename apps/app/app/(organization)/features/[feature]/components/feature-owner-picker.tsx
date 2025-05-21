'use client';

import { updateFeature } from '@/actions/feature/update';
import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import type { Feature } from '@repo/backend/prisma/client';
import { Select } from '@repo/design-system/components/precomposed/select';
import { handleError } from '@repo/design-system/lib/handle-error';
import Image from 'next/image';
import { useState } from 'react';

type FeatureOwnerPickerProperties = {
  readonly featureId: Feature['id'];
  readonly defaultValue: string;
  readonly disabled: boolean;
  readonly data: User[];
};

export const FeatureOwnerPicker = ({
  featureId,
  defaultValue,
  disabled,
  data,
}: FeatureOwnerPickerProperties) => {
  const [value, setValue] = useState(defaultValue);

  const handleSelect = async (newValue: string) => {
    setValue(newValue);

    try {
      const { error } = await updateFeature(featureId, { ownerId: newValue });

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
      data={data.map((user) => ({
        label: getUserName(user),
        value: user.id,
      }))}
      disabled={disabled}
      renderItem={(item) => {
        const user = data.find((user) => user.id === item.value);

        if (!user) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <Image
              src={user.user_metadata.image_url}
              alt={item.label}
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
            <span className="flex-1 truncate">{item.label}</span>
          </div>
        );
      }}
      type="user"
    />
  );
};
