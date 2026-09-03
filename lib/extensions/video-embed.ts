import { Node, mergeAttributes } from '@tiptap/core';

export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-url') ?? '',
        renderHTML: (attributes: { url?: string }) => ({ 'data-url': attributes.url ?? '' }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'video-embed', class: 'video-embed' }),
    ];
  },

  parseHTML() {
    return [{ tag: 'div[data-type="video-embed"]' }];
  },
});
