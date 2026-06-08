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
import type { PostType } from '@prisma/client';
import type { GithubRepoSnapshot } from '@/lib/actions/posts';
import { EmbedNode } from '@/lib/extensions/embed';
import { EmbedCardView } from '@/components/editor/EmbedCardView';
import { CodeBlockView } from '@/components/editor/CodeBlockView';
import { BubbleToolbar } from '@/components/editor/BubbleToolbar';
import { SlashMenu } from '@/components/editor/SlashMenu';

const lowlight = createLowlight(common);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type SavePayload = {
  postId: string;
  title: string;
  excerpt: string;
  contentJson: string;
  wordCount: number;
  tags: string[];
  postType: PostType;
};

export type AttachmentItem = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
};

type Props = {
  postId: string;
  initialTitle?: string;
  initialExcerpt?: string;
  initialContent?: object | null;
  initialTags?: string[];
  allTags?: string[];
  initialPostType?: PostType;
  initialGithubRepoUrl?: string;
  initialGithubRepo?: GithubRepoSnapshot | null;
  initialAttachments?: AttachmentItem[];
  onSave?: (payload: SavePayload) => Promise<void>;
  onSetGithubRepo?: (url: string) => Promise<{ ok: true; repo: GithubRepoSnapshot | null }>;
  onAddAttachment?: (data: {
    url: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
  }) => Promise<{ ok: true; id: string }>;
  onRemoveAttachment?: (attachmentId: string) => Promise<{ ok: true }>;
};

export function TiptapEditor({
  postId,
  initialTitle = '',
  initialExcerpt = '',
  initialContent = null,
  initialTags = [],
  allTags = [],
  initialPostType = 'blog',
  initialGithubRepoUrl = '',
  initialGithubRepo = null,
  initialAttachments = [],
  onSave,
  onSetGithubRepo,
  onAddAttachment,
  onRemoveAttachment,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [postType, setPostType] = useState<PostType>(initialPostType);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [uploading, setUploading] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionName, setMentionName] = useState('');
  const [mentionUrl, setMentionUrl] = useState('');
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedLoading, setEmbedLoading] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState(initialGithubRepoUrl);
  const [githubRepo, setGithubRepoState] = useState<GithubRepoSnapshot | null>(initialGithubRepo);
  const [githubRepoLoading, setGithubRepoLoading] = useState(false);
  const [githubRepoError, setGithubRepoError] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>(initialAttachments);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const titleRef = useRef(title);
  const excerptRef = useRef(excerpt);
  const tagsRef = useRef(tags);
  const postTypeRef = useRef(postType);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputId = useId();
  const attachmentInputId = useId();
  const mentionNameId = useId();

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    excerptRef.current = excerpt;
  }, [excerpt]);

  useEffect(() => {
    postTypeRef.current = postType;
  }, [postType]);

  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  const addTag = (raw: string) => {
    const name = raw.trim().replace(/,/g, '');
    if (!name || tags.some((t) => t.toLowerCase() === name.toLowerCase())) return;
    setTags((prev) => [...prev, name]);
  };

  const removeTag = (name: string) => {
    setTags((prev) => prev.filter((t) => t !== name));
  };

  const suggestions = allTags.filter(
    (t) =>
      !tags.some((tag) => tag.toLowerCase() === t.toLowerCase()) &&
      t.toLowerCase().includes(tagInput.trim().toLowerCase())
  );

  const save = useCallback(
    async (titleVal: string, editorInstance: Editor) => {
      if (!onSave) return;
      setSaveStatus('saving');
      try {
        await onSave({
          postId,
          title: titleVal,
          excerpt: excerptRef.current,
          contentJson: JSON.stringify(editorInstance.getJSON()),
          wordCount: (editorInstance.storage.characterCount as { words: () => number }).words(),
          tags: tagsRef.current,
          postType: postTypeRef.current,
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
      CodeBlockLowlight.configure({ lowlight }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockView);
        },
      }),
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

  const handleExcerptChange = (value: string) => {
    setExcerpt(value);
    if (editor) scheduleSave(editor);
  };

  const handlePostTypeChange = (value: PostType) => {
    setPostType(value);
    if (editor) scheduleSave(editor);
  };

  const fetchGithubRepo = async () => {
    if (!onSetGithubRepo || githubRepoLoading) return;
    setGithubRepoError('');
    setGithubRepoLoading(true);
    try {
      const { repo } = await onSetGithubRepo(githubRepoUrl);
      setGithubRepoState(repo);
    } catch (err) {
      setGithubRepoError(err instanceof Error ? err.message : 'Failed to load repository');
    } finally {
      setGithubRepoLoading(false);
    }
  };

  const clearGithubRepo = async () => {
    if (!onSetGithubRepo || githubRepoLoading) return;
    setGithubRepoError('');
    setGithubRepoLoading(true);
    try {
      await onSetGithubRepo('');
      setGithubRepoUrl('');
      setGithubRepoState(null);
    } catch (err) {
      setGithubRepoError(err instanceof Error ? err.message : 'Failed to clear repository');
    } finally {
      setGithubRepoLoading(false);
    }
  };

  const handleAttachmentUpload = async (file: File) => {
    if (!onAddAttachment || attachmentUploading) return;
    setAttachmentUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('postId', postId);
      form.append('scope', 'attachment');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = (await res.json()) as { url: string };
      const { id } = await onAddAttachment({
        url,
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      });
      setAttachments((prev) => [
        ...prev,
        { id, url, filename: file.name, mimeType: file.type, sizeBytes: file.size },
      ]);
    } catch {
      // silent — user sees no attachment added
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!onRemoveAttachment) return;
    try {
      await onRemoveAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch {
      // silent
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
      if (editor) scheduleSave(editor);
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      const last = tags[tags.length - 1];
      if (last) removeTag(last);
      if (editor) scheduleSave(editor);
    }
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
      form.append('postId', postId);
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
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {statusNode}
          <div className="bg-primary-soft/50 rounded-button flex gap-1 p-1">
            {(['blog', 'tutorial'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handlePostTypeChange(type)}
                className={`rounded-button px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  postType === type
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <span className="text-muted-foreground text-xs">
          {wordCount} words · {readTime} min read
        </span>
      </div>

      <textarea
        value={title}
        onChange={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
          handleTitleChange(e.target.value);
        }}
        onInput={(e) => {
          const t = e.currentTarget;
          t.style.height = 'auto';
          t.style.height = `${t.scrollHeight}px`;
        }}
        placeholder="Title"
        rows={1}
        className="text-foreground placeholder:text-muted-foreground mb-3 w-full resize-none overflow-hidden bg-transparent text-4xl leading-tight font-bold outline-none"
      />

      <textarea
        value={excerpt}
        onChange={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
          handleExcerptChange(e.target.value);
        }}
        placeholder="Short description (excerpt)…"
        rows={1}
        className="text-muted-foreground placeholder:text-muted-foreground mb-4 w-full resize-none overflow-hidden bg-transparent text-lg outline-none"
      />

      {/* Tag input */}
      <div className="mb-6">
        <div className="border-border flex min-h-[36px] flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary-soft text-primary flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => {
                  removeTag(tag);
                  if (editor) scheduleSave(editor);
                }}
                className="hover:text-primary/70 leading-none"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => {
              if (tagInput.trim()) {
                addTag(tagInput);
                setTagInput('');
                if (editor) scheduleSave(editor);
              }
            }}
            placeholder={tags.length === 0 ? 'Add tags (press Enter or comma)…' : ''}
            className="text-foreground placeholder:text-muted-foreground min-w-[120px] flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        {tagInput.trim() && suggestions.length > 0 && (
          <div className="border-border bg-card rounded-card mt-1 border shadow-sm">
            {suggestions.slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                className="text-foreground hover:bg-primary-soft w-full px-3 py-1.5 text-left text-sm"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(s);
                  setTagInput('');
                  if (editor) scheduleSave(editor);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {postType === 'tutorial' && (
        <div className="border-border bg-card rounded-card mb-6 border p-4">
          <p className="text-foreground mb-3 text-sm font-medium">Tutorial settings</p>

          <div className="mb-4">
            <label className="text-muted-foreground mb-1 block text-xs">GitHub repository</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void fetchGithubRepo();
                }}
                placeholder="https://github.com/owner/repo"
                className="border-border text-foreground focus:ring-primary flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-1"
              />
              <button
                type="button"
                onClick={() => void fetchGithubRepo()}
                disabled={githubRepoLoading || !githubRepoUrl.trim()}
                className="rounded-button bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {githubRepoLoading ? 'Loading…' : 'Fetch preview'}
              </button>
              {githubRepo && (
                <button
                  type="button"
                  onClick={() => void clearGithubRepo()}
                  disabled={githubRepoLoading}
                  className="text-muted-foreground hover:text-foreground px-2 text-xs disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
            {githubRepoError && (
              <p className="text-destructive mt-1.5 text-xs">{githubRepoError}</p>
            )}
            {githubRepo && (
              <div className="border-border bg-background mt-2 flex items-start gap-3 rounded-md border p-3">
                {githubRepo.ownerAvatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={githubRepo.ownerAvatar}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-medium">
                    {githubRepo.fullName}
                  </p>
                  {githubRepo.description && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                      {githubRepo.description}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {githubRepo.language && <span>{githubRepo.language} · </span>}⭐{' '}
                    {githubRepo.stars.toLocaleString('en-US')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor={attachmentInputId}
              className={`text-muted-foreground hover:text-foreground inline-block cursor-pointer text-xs ${attachmentUploading ? 'opacity-50' : ''}`}
            >
              {attachmentUploading ? 'Uploading…' : '+ Attach file'}
            </label>
            <input
              id={attachmentInputId}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleAttachmentUpload(file);
                e.target.value = '';
              }}
            />
            {attachments.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="border-border bg-background flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm"
                  >
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary min-w-0 truncate"
                    >
                      {attachment.filename}
                    </a>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {formatFileSize(attachment.sizeBytes)}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleRemoveAttachment(attachment.id)}
                        className="text-muted-foreground hover:text-destructive leading-none"
                        aria-label={`Remove ${attachment.filename}`}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {editor && <BubbleToolbar editor={editor} />}
      {editor && (
        <SlashMenu
          editor={editor}
          onImageClick={() => document.getElementById(fileInputId)?.click()}
          onEmbedClick={() => setEmbedOpen(true)}
        />
      )}
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
