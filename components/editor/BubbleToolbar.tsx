'use client';

import { useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';

type Props = {
  editor: Editor;
};

export function BubbleToolbar({ editor }: Props) {
  const [linkInput, setLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const applyLink = () => {
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
    }
    setLinkUrl('');
    setLinkInput(false);
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setLinkInput(false);
  };

  const isActive = (name: string, attrs?: Record<string, unknown>) => editor.isActive(name, attrs);

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-xs font-medium transition ${
      active ? 'bg-primary text-white' : 'text-foreground hover:bg-primary-soft hover:text-primary'
    }`;

  return (
    <BubbleMenu
      editor={editor}
      className="border-border bg-card flex items-center gap-0.5 rounded-lg border p-1 shadow-md"
    >
      {linkInput ? (
        <div className="flex items-center gap-1 px-1">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink();
              if (e.key === 'Escape') {
                setLinkInput(false);
                setLinkUrl('');
              }
            }}
            placeholder="https://..."
            autoFocus
            className="border-border focus:ring-primary w-48 rounded border px-2 py-0.5 text-xs outline-none focus:ring-1"
          />
          <button type="button" onClick={applyLink} className={btn(false)}>
            OK
          </button>
          <button
            type="button"
            onClick={() => {
              setLinkInput(false);
              setLinkUrl('');
            }}
            className={btn(false)}
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btn(isActive('bold'))}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btn(isActive('italic'))}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btn(isActive('strike'))}
          >
            <s>S</s>
          </button>
          <div className="bg-border mx-1 h-4 w-px" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={btn(isActive('heading', { level: 1 }))}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={btn(isActive('heading', { level: 2 }))}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={btn(isActive('heading', { level: 3 }))}
          >
            H3
          </button>
          <div className="bg-border mx-1 h-4 w-px" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={btn(isActive('blockquote'))}
          >
            ❝
          </button>
          <button
            type="button"
            onClick={() => {
              if (isActive('link')) {
                removeLink();
              } else {
                setLinkInput(true);
              }
            }}
            className={btn(isActive('link'))}
          >
            🔗
          </button>
        </>
      )}
    </BubbleMenu>
  );
}
