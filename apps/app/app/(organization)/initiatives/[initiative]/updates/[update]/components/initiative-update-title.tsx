'use client';

import { updateInitiativeUpdate } from '@/actions/initiative-update/update';
import { DocumentInput } from '@/components/document-input';
import type { InitiativeUpdate } from '@prisma/client';
import { handleError } from '@repo/design-system/lib/handle-error';

type InitiativeUpdateTitleProperties = {
  readonly initiativeUpdateId: InitiativeUpdate['id'];
  readonly defaultTitle: InitiativeUpdate['title'];
  readonly editable: boolean;
};

export const InitiativeUpdateTitle = ({
  initiativeUpdateId,
  defaultTitle,
  editable,
}: InitiativeUpdateTitleProperties) => {
  const handleDebouncedUpdate = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await updateInitiativeUpdate(initiativeUpdateId, { title: value });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <DocumentInput
      defaultValue={defaultTitle}
      onDebouncedUpdate={handleDebouncedUpdate}
      disabled={!editable}
      className="text-3xl"
    />
  );
};
