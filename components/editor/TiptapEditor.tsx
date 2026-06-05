'use client';

import { useCallback, useEffect, useRef, useState, useId } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Image } from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { createLowlight, common } from 'lowlight';
import type { Editor } from '@tiptap/core';
import { EmbedNode } from '@/lib/extensions/embed';
import { EmbedCardView } from '@/components/editor/EmbedCardView';
import { BubbleToolbar } from '@/components/editor/BubbleToolbar';

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
  const [uploading, setUploading] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionName, setMentionName] = useState('');
  const [mentionUrl, setMentionUrl] = useState('');
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedLoading, setEmbedLoading] = useState(false);
  const titleRef = useRef(title);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputId = useId();
  const mentionNameId = useId();

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
      Image.configure({ inline: false, allowBase64: false }),
      EmbedNode.extend({
        addNodeView() {
          return ReactNodeViewRenderer(EmbedCardView);
        },
      }),
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
  const readTime = Math.max(1, Math.ceil(wordCount / 225));

  const insertMention = () => {
    if (!editor || !mentionName.trim()) return;
    const name = mentionName.trim();
    const url = mentionUrl.trim();
    editor
      .chain()
      .focus()
      .insertContent(
        url
          ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="mention">@${name}</a> `
          : `<span class="mention">@${name}</span> `
      )
      .run();
    setMentionName('');
    setMentionUrl('');
    setMentionOpen(false);
  };

  const insertEmbed = async () => {
    if (!editor || !embedUrl.trim() || embedLoading) return;
    setEmbedLoading(true);
    try {
      const res = await fetch(`/api/og?url=${encodeURIComponent(embedUrl.trim())}`);
      const data = (await res.json()) as {
        url: string;
        title: string;
        description: string;
        image: string;
      };
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'embedCard',
          attrs: {
            url: data.url,
            title: data.title ?? '',
            description: data.description ?? '',
            image: data.image ?? '',
          },
        })
        .run();
      setEmbedUrl('');
      setEmbedOpen(false);
    } catch {
      // silent
    } finally {
      setEmbedLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!editor || uploading) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = (await res.json()) as { url: string };
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      // silent — user sees no image inserted
    } finally {
      setUploading(false);
    }
  };

  const statusNode = (() => {
    if (saveStatus === 'saving') {
      return <span className="text-muted-foreground text-sm">Saving...</span>;
    }
    if (saveStatus === 'saved') {
      return (
        <span className="flex items-center gap-1.5 text-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">Draft · Saved · just now</span>
        </span>
      );
    }
    if (saveStatus === 'error') {
      return <span className="text-destructive text-sm">Error saving</span>;
    }
    return <span className="text-muted-foreground text-sm">Draft</span>;
  })();

  return (
    <div className="mx-auto max-w-[700px] py-12">
      <div className="mb-8 flex items-center justify-between">
        {statusNode}
        <span className="text-muted-foreground text-xs">
          {wordCount} words · {readTime} min read
        </span>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Title"
        className="text-foreground placeholder:text-muted-foreground mb-6 w-full bg-transparent text-4xl font-bold outline-none"
      />

      {editor && <BubbleToolbar editor={editor} />}
      <EditorContent editor={editor} />

      {/* Hidden file input for image upload */}
      <input
        id={fileInputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImageUpload(file);
          e.target.value = '';
        }}
      />

      <div className="border-border mt-6 flex items-center gap-3 border-t pt-4">
        <label
          htmlFor={fileInputId}
          className={`text-muted-foreground hover:text-foreground cursor-pointer text-xs ${uploading ? 'opacity-50' : ''}`}
        >
          {uploading ? 'Uploading…' : '+ Image'}
        </label>
        <button
          type="button"
          onClick={() => setMentionOpen(true)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          + @Mention
        </button>
        <button
          type="button"
          onClick={() => setEmbedOpen(true)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          + Embed
        </button>
      </div>

      {/* Mention dialog */}
      {mentionOpen && (
        <div className="border-border bg-card rounded-card mt-3 border p-4 shadow-md">
          <p className="text-foreground mb-3 text-sm font-medium">Insert mention</p>
          <div className="space-y-2">
            <div>
              <label htmlFor={mentionNameId} className="text-muted-foreground mb-1 block text-xs">
                Name *
              </label>
              <input
                id={mentionNameId}
                type="text"
                value={mentionName}
                onChange={(e) => setMentionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') insertMention();
                  if (e.key === 'Escape') setMentionOpen(false);
                }}
                placeholder="Alejandro Jaimes"
                autoFocus
                className="border-border text-foreground focus:ring-primary w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs">
                LinkedIn or GitHub URL (optional)
              </label>
              <input
                type="url"
                value={mentionUrl}
                onChange={(e) => setMentionUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') insertMention();
                  if (e.key === 'Escape') setMentionOpen(false);
                }}
                placeholder="https://linkedin.com/in/..."
                className="border-border text-foreground focus:ring-primary w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={insertMention}
              className="rounded-button bg-primary hover:bg-primary-hover px-3 py-1 text-xs font-medium text-white"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => setMentionOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Embed URL dialog */}
      {embedOpen && (
        <div className="border-border bg-card rounded-card mt-3 border p-4 shadow-md">
          <p className="text-foreground mb-3 text-sm font-medium">Embed link</p>
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void insertEmbed();
              if (e.key === 'Escape') setEmbedOpen(false);
            }}
            placeholder="https://..."
            autoFocus
            className="border-border text-foreground focus:ring-primary mb-3 w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void insertEmbed()}
              disabled={embedLoading}
              className="rounded-button bg-primary hover:bg-primary-hover px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
            >
              {embedLoading ? 'Loading…' : 'Embed'}
            </button>
            <button
              type="button"
              onClick={() => setEmbedOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
