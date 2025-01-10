import { Extension } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import './color-highlighter.css';

const findColors = (mainNode: Node): DecorationSet => {
  const hexColor = /(?<hex>#[0-9a-f]{3,6})\b/giu;
  const decorations: Decoration[] = [];

  mainNode.descendants((node, position) => {
    if (!node.text) {
      return;
    }

    for (const match of node.text.matchAll(hexColor)) {
      const [color] = match;
      const { index } = match;
      const from = position + index;
      const to = from + color.length;
      const decoration = Decoration.inline(from, to, {
        'data-type': 'color',
        style: `--color: ${color}`,
      });

      decorations.push(decoration);
    }
  });

  return DecorationSet.create(mainNode, decorations);
};

export const colorHighlighter = Extension.create({
  name: 'colorHighlighter',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init(_config, { doc }) {
            return findColors(doc);
          },
          apply(transaction, oldState) {
            return transaction.docChanged
              ? findColors(transaction.doc)
              : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
