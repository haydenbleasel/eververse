"use client";

import type { InitiativeUpdate } from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { EditorInstance, JSONContent } from "@repo/editor";
import dynamic from "next/dynamic";
import { updateInitiativeUpdate } from "@/actions/initiative-update/update";
import { staticify } from "@/lib/staticify";

type InitiativeUpdateEditorProperties = {
  readonly defaultValue: JSONContent;
  readonly initiativeUpdateId: InitiativeUpdate["id"];
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

export const InitiativeUpdateEditor = ({
  defaultValue,
  initiativeUpdateId,
  editable,
  subscribed,
}: InitiativeUpdateEditorProperties) => {
  const handleDebouncedUpdate = async (editor?: EditorInstance | undefined) => {
    if (!editor) {
      return;
    }

    const json = editor.getJSON();
    const content = staticify(json);

    try {
      await updateInitiativeUpdate(initiativeUpdateId, {
        content,
      });
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
