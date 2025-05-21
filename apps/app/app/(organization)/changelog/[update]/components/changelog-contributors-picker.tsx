'use client';

import { addChangelogContributor } from '@/actions/changelog-contributor/create';
import { deleteChangelogContributor } from '@/actions/changelog-contributor/delete';
import type { User } from '@repo/backend/auth';
import { getUserName } from '@repo/backend/auth/format';
import type { Changelog } from '@repo/backend/prisma/client';
import { Select } from '@repo/design-system/components/precomposed/select';
import { Tooltip } from '@repo/design-system/components/precomposed/tooltip';
import { Button } from '@repo/design-system/components/ui/button';
import { handleError } from '@repo/design-system/lib/handle-error';
import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type ChangelogContributorsPickerProperties = {
  readonly changelogId: Changelog['id'];
  readonly users: User[];
  readonly defaultContributors: string[];
};

export const ChangelogContributorsPicker = ({
  changelogId,
  users,
  defaultContributors,
}: ChangelogContributorsPickerProperties) => {
  const [loading, setLoading] = useState(false);
  const [contributors, setContributors] =
    useState<string[]>(defaultContributors);

  const handleAddContributor = async (userId: string) => {
    setContributors((previous) => [...previous, userId]);
    setLoading(true);

    try {
      const { error } = await addChangelogContributor({
        changelogId,
        userId,
      });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      setContributors((previous) => previous.filter((id) => id !== userId));
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContributor = async (userId: string) => {
    setContributors((previous) => previous.filter((id) => id !== userId));
    setLoading(true);

    try {
      const { error } = await deleteChangelogContributor({
        changelogId,
        userId,
      });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      setContributors((previous) => [...previous, userId]);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (userId: string | undefined) => {
    if (!userId) {
      return;
    }

    await (contributors.includes(userId)
      ? handleRemoveContributor(userId)
      : handleAddContributor(userId));
  };

  return (
    <Select
      value={contributors}
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
            {user.user_metadata?.image_url ? (
              <Image
                src={user.user_metadata.image_url}
                alt=""
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
          <Tooltip content="Add a new contributor">
            <Button size="icon" variant="ghost" className="-m-1.5 h-6 w-6">
              <PlusIcon size={16} />
              <span className="sr-only">Add a new contributor</span>
            </Button>
          </Tooltip>
        </div>
      }
    />
  );
};
