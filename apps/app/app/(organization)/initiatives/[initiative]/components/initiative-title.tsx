'use client';

import { updateInitiative } from '@/actions/initiative/update';
import { DocumentInput } from '@/components/document-input';
import type { Initiative } from '@repo/backend/prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';

type InitiativeTitleProperties = {
  readonly initiativeId: Initiative['id'];
  readonly defaultTitle: Initiative['title'];
  readonly editable: boolean;
};

export const InitiativeTitle = ({
  initiativeId,
  defaultTitle,
  editable,
}: InitiativeTitleProperties) => {
  const handleDebouncedUpdate = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await updateInitiative(initiativeId, { title: value });
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
