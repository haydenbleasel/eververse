// @ts-nocheck

import { mergeAttributes, Node } from "@tiptap/core";
import "./file.css";

export type FileOptions = {
  HTMLAttributes: Record<string, unknown>;
};

export const fileNode = Node.create<FileOptions>({
  name: "file",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group() {
    return "inline";
  },

  draggable: false,
  content: "text*",
  inline: true,

  addAttributes() {
    return {
      href: {
        default: null,
      },
      fileName: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a.file[href]",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "file",
        target: "_blank",
        rel: "noopener noreferrer",
      }),
      node.attrs.fileName,
    ];
  },

  addCommands() {
    return {
      setFile:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
});
