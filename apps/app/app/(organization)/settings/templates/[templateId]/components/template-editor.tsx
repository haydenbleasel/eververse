"use client";

import type { Template } from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { EditorInstance, JSONContent } from "@repo/editor";
import dynamic from "next/dynamic";
import { updateTemplate } from "@/actions/template/update";
import { staticify } from "@/lib/staticify";

type TemplateEditorProperties = {
  readonly defaultValue: JSONContent;
  readonly templateId: Template["id"];
  readonly editable: boolean;
  readonly subscribed: boolean;
};

const Editor = dynamic(
  async () => {
    const Module = await import(
      /* webpackChunkName: "editor" */
      "@/components/editor"
    );
    return Module.Editor;
  },
  { ssr: false }
);

export const TemplateEditor = ({
  defaultValue,
  templateId,
  editable,
  subscribed,
}: TemplateEditorProperties) => {
  const handleDebouncedUpdate = async (editor?: EditorInstance | undefined) => {
    if (!editor) {
      return;
    }

    const json = editor.getJSON();
    const content = staticify(json);

    try {
      await updateTemplate(templateId, { content });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Editor
      defaultValue={defaultValue}
      editable={editable}
      onDebouncedUpdate={handleDebouncedUpdate}
    />
  );
};
