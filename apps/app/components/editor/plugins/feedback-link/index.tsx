import {
  Node,
  mergeAttributes,
  nodePasteRule,
  reactNodeViewRenderer,
} from '@repo/editor';
import { baseUrl } from '@repo/lib/consts';
import { FeedbackLinkComponent } from './feedback-link-component';

const eververseLinkRegex = new RegExp(
  `^${baseUrl}feedback/([a-zA-Z0-9-]+)$`,
  'ug'
);

export const feedbackLink = Node.create({
  name: 'eververse-feedback-link',
  atom: true,
  group: 'block',
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

  addPasteRules() {
    return [
      nodePasteRule({
        find: eververseLinkRegex,
        type: this.type,
        getAttributes: ([url, feedbackId]) => ({
          url,
          feedbackId,
        }),
      }),
    ];
  },

  parseHTML() {
    return [
      {
        tag: `a[href^="${baseUrl}feedback/"]`,
        getAttrs: (element) => {
          const url =
            typeof element === 'string'
              ? element
              : element.getAttribute('href');
          const feedbackId = url?.split('/').pop() || null;
          return { url, feedbackId };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        href: `${baseUrl}feedback/${HTMLAttributes.feedbackId}`,
      }),
      HTMLAttributes.feedbackId,
    ];
  },

  addNodeView() {
    return reactNodeViewRenderer(
      ({
        node,
      }: {
        node: {
          attrs: Record<string, string>;
        };
      }) => <FeedbackLinkComponent id={node.attrs.feedbackId} />
    );
  },
});
