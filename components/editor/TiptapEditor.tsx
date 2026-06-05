'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import type { Editor } from '@tiptap/core';

const lowlight = createLowlight(common);

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type SavePayload = {
  postId: string;
  title: string;
  contentJson: object;
  wordCount: number;
};

type Props = {
  postId: string;
  initialTitle?: string;
  initialContent?: object | null;
  onSave?: (payload: SavePayload) => Promise<void>;
};

export function TiptapEditor({ postId, initialTitle = '', initialContent = null, onSave }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const titleRef = useRef(title);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  const save = useCallback(
    async (titleVal: string, editorInstance: Editor) => {
      if (!onSave) return;
      setSaveStatus('saving');
      try {
        await onSave({
          postId,
          title: titleVal,
          contentJson: editorInstance.getJSON(),
          wordCount: (editorInstance.storage.characterCount as { words: () => number }).words(),
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    },
    [onSave, postId]
  );

  const scheduleSave = useCallback(
    (editorInstance: Editor) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(titleRef.current, editorInstance), 2000);
    },
    [save]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: 'Tell your story...' }),
      CharacterCount,
    ],
    content: initialContent ?? '',
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate: ({ editor: e }) => scheduleSave(e),
  });

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (editor) scheduleSave(editor);
  };

  const wordCount = editor ? (editor.storage.characterCount as { words: () => number }).words() : 0;

  const statusLabel: Record<SaveStatus, string> = {
    idle: 'Draft',
    saving: 'Saving...',
    saved: 'Draft · Saved',
    error: 'Error saving',
  };

  return (
    <div className="mx-auto max-w-[700px] py-12">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{statusLabel[saveStatus]}</span>
        <span className="text-muted-foreground text-xs">{wordCount} words</span>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Title"
        className="text-foreground placeholder:text-muted-foreground mb-6 w-full bg-transparent text-4xl font-bold outline-none"
      />

      <EditorContent editor={editor} />
    </div>
  );
}
