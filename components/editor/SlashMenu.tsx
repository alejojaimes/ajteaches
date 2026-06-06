'use client';

import { useState, useEffect } from 'react';
import { FloatingMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';

type BlockItem = {
  label: string;
  description: string;
  action: () => void;
};

type Props = {
  editor: Editor;
  onImageClick: () => void;
  onEmbedClick: () => void;
};

export function SlashMenu({ editor, onImageClick, onEmbedClick }: Props) {
  const [open, setOpen] = useState(false);

  const items: BlockItem[] = [
    {
      label: 'H1',
      description: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: 'H2',
      description: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'H3',
      description: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: '•',
      description: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: '1.',
      description: 'Numbered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: '❝',
      description: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: '</>',
      description: 'Code block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: '—',
      description: 'Divider',
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      label: '🖼',
      description: 'Image',
      action: () => {
        onImageClick();
      },
    },
    {
      label: '🔗',
      description: 'Embed',
      action: () => {
        onEmbedClick();
      },
    },
  ];

  const exec = (item: BlockItem) => {
    setOpen(false);
    item.action();
  };

  // P7: watch editor updates to detect a lone "/" typed in an empty paragraph
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { state } = editor;
      const { selection } = state;
      const { $anchor, empty } = selection;
      const isRootDepth = $anchor.depth === 1;
      const isSlashParagraph =
        empty &&
        isRootDepth &&
        $anchor.parent.type.name === 'paragraph' &&
        $anchor.parent.textContent === '/';

      if (isSlashParagraph) {
        // delete the "/" character then open the menu
        editor
          .chain()
          .focus()
          .deleteRange({ from: $anchor.pos - 1, to: $anchor.pos })
          .run();
        setOpen(true);
      }
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  return (
    <FloatingMenu
      editor={editor}
      shouldShow={({ state }) => {
        const { selection } = state;
        const { $anchor, empty } = selection;
        const isRootDepth = $anchor.depth === 1;
        const isEmptyParagraph =
          $anchor.parent.type.name === 'paragraph' && $anchor.parent.content.size === 0;
        return empty && isRootDepth && isEmptyParagraph;
      }}
      className="relative"
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-muted-foreground hover:text-primary hover:bg-primary-soft -ml-8 flex h-6 w-6 items-center justify-center rounded-full text-sm transition"
          title="Insert block"
        >
          +
        </button>

        {/* P8: open upward with smooth entry animation */}
        <div
          className={`border-border bg-card absolute top-auto bottom-8 left-0 z-50 w-52 rounded-lg border p-1 shadow-lg transition-all duration-150 ease-out ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-1 opacity-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.description}
              type="button"
              onClick={() => exec(item)}
              className="hover:bg-primary-soft hover:text-primary flex w-full items-center gap-3 rounded px-3 py-1.5 text-left text-sm"
            >
              <span className="text-muted-foreground w-5 text-center font-mono text-xs">
                {item.label}
              </span>
              <span className="text-foreground">{item.description}</span>
            </button>
          ))}
        </div>
      </div>
    </FloatingMenu>
  );
}
