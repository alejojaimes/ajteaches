'use client';

import { useEffect, useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';

type Props = {
  editor: Editor;
};

export function ImageToolbar({ editor }: Props) {
  const [editingCredit, setEditingCredit] = useState(false);
  const [creditValue, setCreditValue] = useState('');

  const btn =
    'rounded px-2 py-1 text-xs font-medium text-foreground hover:bg-primary-soft hover:text-primary transition';

  const openCreditEditor = () => {
    setCreditValue(String(editor.getAttributes('image').credit ?? ''));
    setEditingCredit(true);
  };

  const applyCredit = () => {
    editor
      .chain()
      .focus()
      .updateAttributes('image', { credit: creditValue.trim() || null })
      .run();
    setEditingCredit(false);
  };

  useEffect(() => {
    const reset = () => {
      if (!editor.isActive('image')) setEditingCredit(false);
    };
    editor.on('selectionUpdate', reset);
    return () => {
      editor.off('selectionUpdate', reset);
    };
  }, [editor]);

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e }) => e.isActive('image')}
      className="border-border bg-card flex items-center gap-0.5 rounded-lg border p-1 shadow-md"
    >
      {editingCredit ? (
        <div className="flex items-center gap-1 px-1">
          <input
            type="text"
            value={creditValue}
            onChange={(e) => setCreditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyCredit();
              if (e.key === 'Escape') setEditingCredit(false);
            }}
            placeholder="e.g. Image by the author"
            autoFocus
            className="border-border focus:ring-primary w-56 rounded border px-2 py-0.5 text-xs outline-none focus:ring-1"
          />
          <button type="button" onClick={applyCredit} className={btn}>
            OK
          </button>
          <button type="button" onClick={() => setEditingCredit(false)} className={btn}>
            ✕
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={openCreditEditor}
            className={btn}
            title="Add credit/source"
          >
            {editor.getAttributes('image').credit ? 'Edit credit' : '+ Credit'}
          </button>
          <div className="bg-border mx-1 h-4 w-px" />
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className="text-destructive hover:bg-primary-soft rounded px-2 py-1 text-xs font-medium transition"
            title="Remove image"
          >
            ✕ Remove
          </button>
        </>
      )}
    </BubbleMenu>
  );
}
