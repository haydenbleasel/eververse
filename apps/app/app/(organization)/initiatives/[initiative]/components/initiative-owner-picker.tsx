'use client';

import { updateInitiative } from '@/actions/initiative/update';
import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import type { Initiative } from '@repo/backend/prisma/client';
import { Avatar } from '@repo/design-system/components/precomposed/avatar';
import { Select } from '@repo/design-system/components/precomposed/select';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useState } from 'react';

type InitiativeOwnerPickerProperties = {
  readonly initiativeId: Initiative['id'];
  readonly defaultValue: string;
  readonly disabled: boolean;
  readonly data: User[];
};

export const InitiativeOwnerPicker = ({
  initiativeId,
  defaultValue,
  disabled,
  data,
}: InitiativeOwnerPickerProperties) => {
  const [value, setValue] = useState(defaultValue);

  const handleSelect = async (newValue: string) => {
    setValue(newValue);

    try {
      const { error } = await updateInitiative(initiativeId, {
        ownerId: newValue,
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
      disabled={disabled}
      onChange={handleSelect}
      data={data.map((member) => ({
        label: getUserName(member),
        value: member.id,
      }))}
      renderItem={(item) => {
        const assignee = data.find((member) => member.id === item.value);

        if (!assignee) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar src={assignee.user_metadata.image_url} />
            <span className="flex-1 truncate">{item.label}</span>
          </div>
        );
      }}
      type="user"
    />
  );
};
