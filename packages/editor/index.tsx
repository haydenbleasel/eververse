"use client";

import { useDebouncedCallback } from "@react-hookz/web";
import { Prose } from "@repo/design-system/components/prose";
import type { Extensions } from "@tiptap/core";
import deepEqual from "deep-equal";
import type { EditorContentProps, EditorInstance, JSONContent } from "novel";
import { EditorContent, EditorRoot } from "novel";
import { handleCommandNavigation } from "novel/extensions";
import { type ReactNode, useRef } from "react";
import { BubbleMenu } from "./components/menus/bubble-menu";
import { CommandMenu } from "./components/menus/command-menu";
import { TableMenu } from "./components/menus/table-menu";
import { slashCommand } from "./components/slash-command";
import { defaultExtensions } from "./lib/extensions/client";

import "./styles/editor.css";

export type {
  Extensions,
  JSONContent,
} from "@tiptap/core";
export { mergeAttributes, Node, nodePasteRule } from "@tiptap/core";
export {
  NodeViewWrapper,
  ReactNodeViewRenderer as reactNodeViewRenderer,
} from "@tiptap/react";
export type { EditorInstance } from "novel";
export { EditorBubbleItem, useEditor } from "novel";

export type EditorProperties = {
  readonly children?: ReactNode;
  readonly defaultValue?: JSONContent;
  readonly editorProps?: EditorContentProps["editorProps"];
  readonly onUpdate?: (editor?: EditorInstance) => Promise<void> | void;
  readonly onDebouncedUpdate?: (
    editor?: EditorInstance
  ) => Promise<void> | void;
  readonly editable?: boolean;
  readonly extensions?: Extensions;
  readonly slotAfter?: ReactNode;
  readonly className?: string;
};

export const Editor = ({
  defaultValue,
  editorProps,
  onUpdate,
  onDebouncedUpdate,
  editable = true,
  extensions,
  slotAfter,
  children,
  className,
}: EditorProperties) => {
  const lastSnapshot = useRef<JSONContent | null>(null);
  const handleDebouncedUpdate = useDebouncedCallback(
    ({ editor }: { editor: EditorInstance }) => {
      const newSnapshot = structuredClone(editor.getJSON());
      const isSame = deepEqual(lastSnapshot.current, newSnapshot);

      if (!isSame) {
        onDebouncedUpdate?.(editor);
        lastSnapshot.current = structuredClone(newSnapshot);
      }
    },
    [],
    500
  );

  const handleUpdate = async ({ editor }: { editor: EditorInstance }) =>
    Promise.all([onUpdate?.(editor), handleDebouncedUpdate({ editor })]);

  return (
    <div className="relative w-full">
      <Prose className={className}>
        <EditorRoot>
          <EditorContent
            className="relative min-h-[5rem] w-full"
            editable={editable}
            editorProps={{
              ...editorProps,
              handleDOMEvents: {
                keydown: (_view, event) => handleCommandNavigation(event),
              },
              attributes: {
                class: "focus:outline-none",
              },
            }}
            extensions={
              [
                ...defaultExtensions,
                slashCommand,
                ...(extensions ?? []),
              ] as never
            }
            immediatelyRender={false}
            initialContent={defaultValue}
            onUpdate={handleUpdate}
            slotAfter={slotAfter}
          >
            {editable && !children ? (
              <>
                <CommandMenu />
                <BubbleMenu />
                <TableMenu />
              </>
            ) : null}
            {children}
          </EditorContent>
        </EditorRoot>
      </Prose>
    </div>
  );
};
