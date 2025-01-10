const applyModifier = (
  node: unknown,
  modifier: (n: unknown) => unknown
): unknown => {
  if (typeof node !== 'object' || node === null) {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((item) => applyModifier(item, modifier)).filter(Boolean);
  }

  const modifiedNode = modifier(node);

  if (typeof modifiedNode === 'object' && modifiedNode !== null) {
    return Object.fromEntries(
      Object.entries(modifiedNode)
        .map(([key, value]) => [key, applyModifier(value, modifier)])
        .filter(([_, value]) => value !== null)
    );
  }

  return modifiedNode;
};

const isNodeOfType = (node: unknown, types: string[]): boolean =>
  typeof node === 'object' &&
  node !== null &&
  'type' in node &&
  typeof node.type === 'string' &&
  types.includes(node.type);

const hasAttrs = (node: unknown): node is { attrs: Record<string, unknown> } =>
  typeof node === 'object' &&
  node !== null &&
  'attrs' in node &&
  typeof node.attrs === 'object' &&
  node.attrs !== null;

const removeBulletListAttrs = (node: unknown): unknown => {
  if (isNodeOfType(node, ['bulletList'])) {
    const { attrs, ...rest } = node as {
      attrs?: unknown;
      [key: string]: unknown;
    };
    return rest;
  }
  return node;
};

const replaceOrderedListAttrs = (node: unknown): unknown => {
  if (isNodeOfType(node, ['orderedList']) && hasAttrs(node)) {
    const { start, tight, ...restAttrs } = node.attrs;
    return { ...node, attrs: { ...restAttrs, order: start } };
  }
  return node;
};

const replaceMarkAttributes = (node: unknown): unknown => {
  if (
    isNodeOfType(node, ['text']) &&
    typeof node === 'object' &&
    node !== null &&
    'marks' in node &&
    Array.isArray(node.marks)
  ) {
    const updatedMarks = node.marks
      .map((mark: unknown) => {
        if (typeof mark === 'object' && mark !== null && 'type' in mark) {
          if (
            mark.type === 'textColor' &&
            'attrs' in mark &&
            Object.keys(mark.attrs as object).length === 0
          ) {
            return null;
          }
          switch (mark.type) {
            case 'bold':
              return { ...mark, type: 'strong' };
            case 'italic':
              return { ...mark, type: 'em' };
            case 'superscript':
              return { ...mark, type: 'subsup', attrs: { type: 'sup' } };
            case 'subscript':
              return { ...mark, type: 'subsup', attrs: { type: 'sub' } };
            default:
              return mark;
          }
        }
        return mark;
      })
      .filter(Boolean);

    if (updatedMarks.length === 0) {
      const { marks, ...rest } = node;
      return rest;
    }

    return { ...node, marks: updatedMarks };
  }
  return node;
};

const setDefaultCodeBlockLanguage = (node: unknown): unknown => {
  if (
    isNodeOfType(node, ['codeBlock']) &&
    hasAttrs(node) &&
    'language' in node.attrs &&
    node.attrs.language === null
  ) {
    return {
      ...node,
      attrs: { ...node.attrs, language: 'javascript' },
    };
  }
  return node;
};

const removeIncompatibleNodes = (node: unknown): unknown => {
  if (isNodeOfType(node, ['image', 'file', 'youtube', 'iframely', 'figma'])) {
    return null;
  }
  return node;
};

const setEmptyColwidth = (node: unknown): unknown => {
  if (
    isNodeOfType(node, ['tableHeader', 'tableCell']) &&
    hasAttrs(node) &&
    'colwidth' in node.attrs &&
    node.attrs.colwidth === null
  ) {
    return {
      ...node,
      attrs: { ...node.attrs, colwidth: [] },
    };
  }
  return node;
};

const replaceHorizontalRule = (node: unknown): unknown => {
  if (isNodeOfType(node, ['horizontalRule'])) {
    return { type: 'rule' };
  }
  return node;
};

const removeEmptyParagraphs = (node: unknown): unknown => {
  if (
    isNodeOfType(node, ['paragraph']) &&
    Object.keys(node as object).length === 1
  ) {
    return null;
  }
  return node;
};

const removeLinkAttributes = (node: unknown): unknown => {
  if (
    isNodeOfType(node, ['text']) &&
    typeof node === 'object' &&
    node !== null &&
    'marks' in node &&
    Array.isArray(node.marks)
  ) {
    const updatedMarks = node.marks.map((mark: unknown) => {
      if (
        typeof mark === 'object' &&
        mark !== null &&
        'type' in mark &&
        mark.type === 'link' &&
        'attrs' in mark &&
        typeof mark.attrs === 'object' &&
        mark.attrs !== null
      ) {
        const {
          rel,
          class: className,
          target,
          ...restAttrs
        } = mark.attrs as Record<string, unknown>;
        return { ...mark, attrs: restAttrs };
      }
      return mark;
    });

    if (updatedMarks.length === 0) {
      const { marks, ...rest } = node;
      return rest;
    }

    return { ...node, marks: updatedMarks };
  }
  return node;
};

const convertEmojiAttributes = (node: unknown): unknown => {
  if (
    isNodeOfType(node, ['emoji']) &&
    hasAttrs(node) &&
    'name' in node.attrs &&
    typeof node.attrs.name === 'string'
  ) {
    const { name, ...restAttrs } = node.attrs;
    return {
      ...node,
      attrs: {
        ...restAttrs,
        shortName: `:${name}:`,
      },
    };
  }
  return node;
};

const modifiers = [
  removeBulletListAttrs,
  replaceOrderedListAttrs,
  replaceMarkAttributes,
  setDefaultCodeBlockLanguage,
  setEmptyColwidth,
  removeIncompatibleNodes,
  replaceHorizontalRule,
  removeEmptyParagraphs,
  removeLinkAttributes,
  convertEmojiAttributes,
];

export const convertToAdf = (body: object): object => {
  const applyAllModifiers = (node: unknown): unknown =>
    modifiers.reduce((acc, modifier) => applyModifier(acc, modifier), node);

  return applyAllModifiers(body) as object;
};
