import { Node, mergeAttributes } from '@tiptap/core';

export const UploadPlaceholder = Node.create({
  name: 'uploadPlaceholder',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      uploadId: {
        default: '',
        renderHTML: (attrs) => ({ 'data-upload-id': attrs.uploadId as string }),
        parseHTML: (el) => el.getAttribute('data-upload-id') ?? '',
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'upload-placeholder',
        class: 'upload-placeholder',
      }),
    ];
  },

  parseHTML() {
    return [{ tag: 'div[data-type="upload-placeholder"]' }];
  },
});
