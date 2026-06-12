'use client';

import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';

type Props = {
  editor: Editor;
};

export function TableToolbar({ editor }: Props) {
  const btn =
    'rounded px-2 py-1 text-xs font-medium text-foreground hover:bg-primary-soft hover:text-primary transition';

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e }) => e.isActive('table')}
      className="border-border bg-card flex items-center gap-0.5 rounded-lg border p-1 shadow-md"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        className={btn}
        title="Add column before"
      >
        ←Col
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className={btn}
        title="Add column after"
      >
        Col→
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className={btn}
        title="Delete column"
      >
        ✕Col
      </button>
      <div className="bg-border mx-1 h-4 w-px" />
      <button
        type="button"
        onClick={() => editor.chain().focus().addRowBefore().run()}
        className={btn}
        title="Add row before"
      >
        ↑Row
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className={btn}
        title="Add row after"
      >
        Row↓
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteRow().run()}
        className={btn}
        title="Delete row"
      >
        ✕Row
      </button>
      <div className="bg-border mx-1 h-4 w-px" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        className={btn}
        title="Toggle header row"
      >
        Header
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
        className={btn}
        title="Merge or split cells"
      >
        Merge
      </button>
      <div className="bg-border mx-1 h-4 w-px" />
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="text-destructive hover:bg-primary-soft rounded px-2 py-1 text-xs font-medium transition"
        title="Delete table"
      >
        ✕ Table
      </button>
    </BubbleMenu>
  );
}
