"use client";

import type { InitiativePage } from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import { updateInitiativePage } from "@/actions/initiative-page/update";
import { DocumentInput } from "@/components/document-input";

type InitiativePageTitleProperties = {
  readonly pageId: InitiativePage["id"];
  readonly defaultTitle: InitiativePage["title"];
  readonly editable: boolean;
};

export const InitiativePageTitle = ({
  pageId,
  defaultTitle,
  editable,
}: InitiativePageTitleProperties) => {
  const handleDebouncedUpdate = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await updateInitiativePage(pageId, { title: value });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <DocumentInput
      defaultValue={defaultTitle}
      disabled={!editable}
      onDebouncedUpdate={handleDebouncedUpdate}
    />
  );
};
