"use client";

import type { Feature } from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { EditorInstance, JSONContent } from "@repo/editor";
import dynamic from "next/dynamic";
import { updateFeature } from "@/actions/feature/update";
import { staticify } from "@/lib/staticify";

type FeatureEditorProperties = {
  readonly defaultValue: JSONContent;
  readonly featureId: Feature["id"];
  readonly editable: boolean;
  readonly className?: string;
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

export const FeatureEditor = ({
  defaultValue,
  featureId,
  editable,
  className,
}: FeatureEditorProperties) => {
  const handleDebouncedUpdate = async (editor?: EditorInstance | undefined) => {
    if (!editor) {
      return;
    }

    const json = editor.getJSON();
    const content = staticify(json);

    try {
      await updateFeature(featureId, { content });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Editor
      className={className}
      defaultValue={defaultValue}
      editable={editable}
      onDebouncedUpdate={handleDebouncedUpdate}
    />
  );
};
