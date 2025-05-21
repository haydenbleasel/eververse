'use client';

import { updateChangelog } from '@/actions/changelog/update';
import type { Changelog } from '@repo/backend/prisma/client';
import { Switch } from '@repo/design-system/components/precomposed/switch';
import { handleError } from '@repo/design-system/lib/handle-error';
import { useState } from 'react';

type ChangelogStatusPickerProperties = {
  readonly changelogId: Changelog['id'];
  readonly defaultValue: Changelog['status'];
  readonly disabled: boolean;
};

export const ChangelogStatusPicker = ({
  changelogId,
  defaultValue,
  disabled,
}: ChangelogStatusPickerProperties) => {
  const [published, setPublished] = useState<boolean>(
    defaultValue === 'PUBLISHED'
  );

  const handleSelect = async (newPublished: boolean) => {
    setPublished(newPublished);

    try {
      const { error } = await updateChangelog(changelogId, {
        status: newPublished ? 'PUBLISHED' : 'DRAFT',
      });

      if (error) {
        throw new Error(error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Switch
      checked={published}
      onCheckedChange={handleSelect}
      description={published ? 'Published' : 'Draft'}
      disabled={disabled}
    />
  );
};
