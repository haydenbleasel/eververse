'use client';

import { addInitiativeMember } from '@/actions/initiative-member/create';
import { deleteInitiativeMember } from '@/actions/initiative-member/delete';
import type { Initiative } from '@prisma/client';
import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import { Select } from '@repo/design-system/components/precomposed/select';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type InitiativeMemberPickerProperties = {
  readonly initiativeId: Initiative['id'];
  readonly users: User[];
  readonly defaultMembers: string[];
};

export const InitiativeMemberPicker = ({
  initiativeId,
  users,
  defaultMembers,
}: InitiativeMemberPickerProperties) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<string[]>(defaultMembers);

  const handleAddMember = async (userId: string) => {
    setMembers((previous) => [...previous, userId]);
    setLoading(true);

    try {
      const { error } = await addInitiativeMember({
        initiativeId,
        userId,
      });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      setMembers((previous) => previous.filter((id) => id !== userId));
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setMembers((previous) => previous.filter((id) => id !== userId));
    setLoading(true);

    try {
      const { error } = await deleteInitiativeMember({
        initiativeId,
        userId,
      });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      setMembers((previous) => [...previous, userId]);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (userId: string | undefined) => {
    if (!userId) {
      return;
    }

    await (members.includes(userId)
      ? handleRemoveMember(userId)
      : handleAddMember(userId));
  };

  return (
    <Select
      value={members}
      onChange={handleSelect}
      data={users.map((user) => ({
        label: getUserName(user),
        value: user.id,
      }))}
      disabled={loading}
      renderItem={(item) => {
        const user = users.find((user) => user.id === item.value);

        if (!user) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            {user.user_metadata.image_url ? (
              <Image
                src={user.user_metadata.image_url}
                alt={item.label}
                width={24}
                height={24}
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-card" />
            )}
            <span className="flex-1 truncate">{item.label}</span>
          </div>
        );
      }}
      type="user"
      trigger={
        <div>
          <Tooltip content="Add a new member">
            <Button size="icon" variant="ghost" className="-m-1.5 h-6 w-6">
              <PlusIcon size={16} />
              <span className="sr-only">Add a new member</span>
            </Button>
          </Tooltip>
        </div>
      }
    />
  );
};
