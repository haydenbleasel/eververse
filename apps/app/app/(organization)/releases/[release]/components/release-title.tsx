"use client";

import type { Release } from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import { updateRelease } from "@/actions/release/update";
import { DocumentInput } from "@/components/document-input";

type ReleaseTitleProperties = {
  readonly releaseId: Release["id"];
  readonly defaultTitle: Release["title"];
  readonly editable: boolean;
};

export const ReleaseTitle = ({
  releaseId,
  defaultTitle,
  editable,
}: ReleaseTitleProperties) => {
  const handleDebouncedUpdate = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await updateRelease(releaseId, { title: value });
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
