"use client";

import type { Feedback } from "@repo/backend/prisma/client";
import { handleError } from "@repo/design-system/lib/handle-error";
import type { EditorInstance, JSONContent } from "@repo/editor";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { updateFeedback } from "@/actions/feedback/update";
import { staticify } from "@/lib/staticify";

type FeedbackEditorProperties = {
  readonly defaultValue: JSONContent | undefined;
  readonly feedbackId: Feedback["id"];
  readonly children?: ReactNode;
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
  {
    ssr: false,
  }
);

export const FeedbackEditor = ({
  defaultValue,
  feedbackId,
  children,
  editable,
  subscribed,
}: FeedbackEditorProperties) => {
  const handleDebouncedUpdate = async (editor?: EditorInstance | undefined) => {
    if (!editor) {
      return;
    }

    const json = editor.getJSON();
    const content = staticify(json);

    try {
      await updateFeedback(feedbackId, {
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
