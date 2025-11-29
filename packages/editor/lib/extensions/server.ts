import { baseUrl } from "@repo/lib/consts";
import { type Extension, mergeAttributes, Node } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
// Not used, but required for older content / migrations
import Youtube from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";
import Details from "@tiptap-pro/extension-details";
import DetailsContent from "@tiptap-pro/extension-details-content";
import DetailsSummary from "@tiptap-pro/extension-details-summary";
import Emoji from "@tiptap-pro/extension-emoji";
import UniqueId from "@tiptap-pro/extension-unique-id";
import { Figma } from "tiptap-extension-figma/server";
import { Iframely } from "tiptap-extension-iframely/server";
import { Jira } from "tiptap-extension-jira/server";
import { feedbackFeatureMark } from "../../components/plugins/feedback-feature-mark";

const FileNode = Node.create({
  name: "file",
  group: "inline",
  inline: true,
  selectable: true,
  draggable: true,

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
});

const FeedbackLink = Node.create({
  name: "eververse-feedback-link",
  atom: true,
  group: "block",
  inline: false,

  addAttributes() {
    return {
      url: {
        default: null,
      },
      feedbackId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="eververse-feedback-link"]',
        getAttrs: (element) => ({
          url:
            typeof element === "string"
              ? element
              : element.getAttribute("href"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-type": "eververse-feedback-link",
        href: `${baseUrl}feedback/${HTMLAttributes.feedbackId}`,
      }),
      HTMLAttributes.feedbackId,
    ];
  },
});

export const defaultExtensions = [
  Link,
  Image,
  TaskList,
  TaskItem,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  Youtube,
  UniqueId,
  Superscript,
  Subscript,
  StarterKit,
  Highlight,
  Underline,
  TextStyle,
  Emoji,
  Details,
  DetailsContent,
  DetailsSummary,
  Color,
  feedbackFeatureMark,
  Figma,
  FileNode,
  Iframely,
  FeedbackLink,
  ...Object.values(Jira),
] as Extension[];
