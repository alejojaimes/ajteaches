import { Node, mergeAttributes } from '@tiptap/core';

export const EmbedNode = Node.create({
  name: 'embedCard',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      title: { default: '' },
      description: { default: '' },
      image: { default: '' },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'embed-card',
        class: 'embed-card',
      }),
    ];
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed-card"]' }];
  },
});
