import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';

const INLINE_MATH_INPUT_REGEX = /(?<=^|\s)\$(?:[^$\n]+)\$$/;
const BLOCK_MATH_INPUT_REGEX = /^\$\$(?:[^$]+)\$\$$/;

export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-latex') ?? '',
        renderHTML: (attributes: { latex?: string }) => ({ 'data-latex': attributes.latex ?? '' }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-type': 'math-inline', class: 'math-inline' }),
    ];
  },

  parseHTML() {
    return [{ tag: 'span[data-type="math-inline"]' }];
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: INLINE_MATH_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => ({ latex: match[0].slice(1, -1) }),
      }),
    ];
  },
});

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-latex') ?? '',
        renderHTML: (attributes: { latex?: string }) => ({ 'data-latex': attributes.latex ?? '' }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'math-block', class: 'math-block' }),
    ];
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }];
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: BLOCK_MATH_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => ({ latex: match[0].slice(2, -2) }),
      }),
    ];
  },
});
