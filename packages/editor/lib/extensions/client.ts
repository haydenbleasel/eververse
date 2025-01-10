import { cn } from '@repo/design-system/lib/utils';
import Details from '@tiptap-pro/extension-details';
import DetailsContent from '@tiptap-pro/extension-details-content';
import DetailsSummary from '@tiptap-pro/extension-details-summary';
import Emoji from '@tiptap-pro/extension-emoji';
import FileHandler from '@tiptap-pro/extension-file-handler';
import UniqueId from '@tiptap-pro/extension-unique-id';
import Color from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { Underline } from '@tiptap/extension-underline';
import {
  HorizontalRule,
  MarkdownExtension,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TiptapImage,
  TiptapLink,
  UpdatedImage,
} from 'novel/extensions';
import { Figma } from 'tiptap-extension-figma';
import { Iframely } from 'tiptap-extension-iframely';
import { Jira } from 'tiptap-extension-jira';
import { codeBlock } from '../../components/plugins/code-block';
import { colorHighlighter } from '../../components/plugins/color-highlighter';
import { emojiSuggestion } from '../../components/plugins/emoji';
import { feedbackFeatureMark } from '../../components/plugins/feedback-feature-mark';
import { fileNode } from '../../components/plugins/file';
import { startImageUpload, uploadImagesPlugin } from '../../lib/upload-file';

import type { Extension } from '@tiptap/core';
// Not used, but required for older content / migrations
import Youtube from '@tiptap/extension-youtube';

const placeholder = Placeholder;

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cn(
      'cursor-pointer text-muted-foreground underline underline-offset-[3px] transition-colors',
      'hover:text-violet-500',
      'dark:hover:text-violet-400'
    ),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [uploadImagesPlugin()];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: 'rounded-lg border',
  },
});

const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: 'rounded-lg border',
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: 'not-prose pl-2',
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: 'flex items-start my-2',
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: 'mt-4 mb-6 border-t',
  },
});

const table = Table.configure({
  HTMLAttributes: {
    class:
      'table-fixed m-0 overflow-hidden mx-auto my-3 border-collapse rounded-none',
  },
  allowTableNodeSelection: true,
});

const tableRow = TableRow.configure({
  HTMLAttributes: {
    class:
      'border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1',
  },
});

const tableCell = TableCell.configure({
  HTMLAttributes: {
    class:
      'border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1',
  },
});

const tableHeader = TableHeader.configure({
  HTMLAttributes: {
    class:
      'bg-background font-semibold border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1',
  },
});

const youtube = Youtube.configure({
  inline: false,
});

const uniqueId = UniqueId.configure({
  attributeName: 'uid',
});

const emoji = Emoji.configure({
  suggestion: emojiSuggestion,
});

const superscript = Superscript.configure();
const subscript = Subscript.configure();
const details = Details.configure();
const detailsContent = DetailsContent.configure();
const detailsSummary = DetailsSummary.configure();
const color = Color.configure();
const underline = Underline.configure();
const markdown = MarkdownExtension.configure();

const fileHandler = FileHandler.configure({
  onPaste: async (editor, files, htmlContent) => {
    if (htmlContent) {
      return;
    }

    const promises = files.map(async (file) =>
      startImageUpload(file, editor.view, editor.view.state.selection.from)
    );

    await Promise.all(promises);
  },
  onDrop: async (editor, files, pos) => {
    const promises = files.map(async (file) =>
      startImageUpload(file, editor.view, pos)
    );

    await Promise.all(promises);
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: 'list-disc list-outside leading-3',
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: 'list-decimal list-outside leading-3',
    },
  },
  listItem: {
    HTMLAttributes: {
      class: 'leading-normal -mb-2',
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: 'border-l-4 border-primary',
    },
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      class: 'rounded-md px-1.5 py-1 font-mono font-medium bg-background',
      spellcheck: 'false',
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: '#DBEAFE',
    width: 4,
  },
  history: false,
});

const { Mention, ...jira } = Jira;

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  updatedImage,
  taskList,
  taskItem,
  horizontalRule,
  colorHighlighter,
  fileNode,
  table,
  tableRow,
  tableCell,
  tableHeader,
  codeBlock,
  youtube,
  uniqueId,
  emoji,
  fileHandler,
  superscript,
  subscript,
  color,
  details,
  detailsContent,
  detailsSummary,
  feedbackFeatureMark,
  underline,
  markdown,
  Figma,
  Iframely,
  ...Object.values(jira),
] as Extension[];
