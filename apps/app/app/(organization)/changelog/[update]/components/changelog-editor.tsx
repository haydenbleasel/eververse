"use client";

import type { Changelog } from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { EditorInstance, JSONContent } from "@repo/editor";
import dynamic from "next/dynamic";
import { updateChangelog } from "@/actions/changelog/update";
import { staticify } from "@/lib/staticify";

type ChangelogEditorProperties = {
  readonly defaultValue: JSONContent;
  readonly changelogId: Changelog["id"];
  readonly editable: boolean;
};

const Editor = dynamic(
  async () => {
    const Module = await import(
      /* webpackChunkName: "editor" */
      "@/components/editor"
    );

    return Module.Editor;
  },
  {
    ssr: false,
  }
);

export const ChangelogEditor = ({
  defaultValue,
  changelogId,
  editable,
}: ChangelogEditorProperties) => {
  const handleDebouncedUpdate = async (editor?: EditorInstance | undefined) => {
    if (!editor) {
      return;
    }

    const json = editor.getJSON();
    const content = staticify(json);

    try {
      await updateChangelog(changelogId, {
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
