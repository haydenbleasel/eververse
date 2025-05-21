'use client';

import { updateChangelog } from '@/actions/changelog/update';
import { DocumentInput } from '@/components/document-input';
import type { Changelog } from '@repo/backend/prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';

type ChangelogTitleProperties = {
  readonly changelogId: Changelog['id'];
  readonly defaultTitle: Changelog['title'];
  readonly editable: boolean;
};

export const ChangelogTitle = ({
  changelogId,
  defaultTitle,
  editable,
}: ChangelogTitleProperties) => {
  const handleDebouncedUpdate = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await updateChangelog(changelogId, { title: value });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <DocumentInput
      defaultValue={defaultTitle}
      onDebouncedUpdate={handleDebouncedUpdate}
      disabled={!editable}
    />
  );
};
