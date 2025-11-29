"use client";

import type { Template } from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import { updateTemplate } from "@/actions/template/update";
import { DocumentInput } from "@/components/document-input";

type TemplateTitleProperties = {
  readonly templateId: Template["id"];
  readonly defaultTitle: Template["title"];
  readonly editable: boolean;
};

export const TemplateTitle = ({
  templateId,
  defaultTitle,
  editable,
}: TemplateTitleProperties) => {
  const handleDebouncedUpdate = async (value: string) => {
    if (!value) {
      return;
    }

    try {
      await updateTemplate(templateId, { title: value });
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
