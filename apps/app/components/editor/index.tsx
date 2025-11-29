import type { EditorProperties, Extensions } from "@repo/editor";
import dynamic from "next/dynamic";
import { ImageResizer } from "novel/extensions";
import { feedbackLink } from "./plugins/feedback-link";

type SingleEditorProperties = EditorProperties;

const extensions: Extensions = [feedbackLink];

const EditorInner = dynamic(
  async () => {
    const component = await import(
      /* webpackChunkName: "editor" */
      "@repo/editor"
    );

    return component.Editor;
  },
  { ssr: false }
);

export const Editor = (properties: SingleEditorProperties) => (
  <EditorInner
    extensions={extensions}
    {...properties}
    slotAfter={<ImageResizer />}
  />
);
