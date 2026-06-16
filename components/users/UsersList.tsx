'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Copy, Check, Mail, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { sendEmailToReaders } from '@/lib/actions/readers';
import type { ReaderListItem } from '@/lib/db/readers';
import type { EmailTemplateItem } from '@/lib/actions/email-templates';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

type Props = {
  readers: ReaderListItem[];
  templates: EmailTemplateItem[];
};

export function UsersList({ readers, templates }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const selectable = readers.filter((r) => r.email).map((r) => r.id);
    setSelected((prev) => (prev.size === selectable.length ? new Set() : new Set(selectable)));
  };

  const copyEmail = async (id: string, email: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
  };

  const selectableCount = readers.filter((r) => r.email).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selectableCount > 0 && selected.size === selectableCount}
            onChange={toggleAll}
            disabled={selectableCount === 0}
            className="accent-primary h-4 w-4"
          />
          Select all
        </label>
        <button
          type="button"
          disabled={selected.size === 0}
          onClick={() => setComposeOpen(true)}
          className="rounded-button bg-primary hover:bg-primary-hover inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Mail className="h-4 w-4" />
          Email selected ({selected.size})
        </button>
      </div>

      <div className="border-border divide-border bg-card divide-y rounded-xl border">
        {readers.map((reader) => (
          <div key={reader.id} className="flex items-center gap-3 p-4">
            <input
              type="checkbox"
              checked={selected.has(reader.id)}
              onChange={() => toggle(reader.id)}
              disabled={!reader.email}
              className="accent-primary h-4 w-4"
            />
            <Avatar size="sm">
              {reader.avatar && <AvatarImage src={reader.avatar} alt={reader.name} />}
              <AvatarFallback className="bg-primary text-[10px] font-bold text-white">
                {getInitials(reader.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-medium">{reader.name}</p>
              <p className="text-muted-foreground truncate text-xs">{reader.email ?? 'No email'}</p>
            </div>
            {reader.newsletterOptIn && (
              <span className="rounded-badge bg-accent/10 text-accent hidden px-2 py-1 text-xs font-semibold sm:inline-block">
                Subscribed
              </span>
            )}
            <span className="text-muted-foreground hidden text-xs sm:inline">
              Joined {dateFormatter.format(reader.createdAt)}
            </span>
            {reader.email && (
              <button
                type="button"
                onClick={() => void copyEmail(reader.id, reader.email!)}
                aria-label="Copy email"
                className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
              >
                {copiedId === reader.id ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        ))}
        {readers.length === 0 && (
          <p className="text-muted-foreground p-6 text-center text-sm">No users yet.</p>
        )}
      </div>

      {composeOpen && (
        <ComposeEmailDialog
          selectedReaders={readers.filter((r) => selected.has(r.id))}
          templates={templates}
          onClose={() => setComposeOpen(false)}
        />
      )}
    </div>
  );
}

function ComposeEmailDialog({
  selectedReaders,
  templates,
  onClose,
}: {
  selectedReaders: ReaderListItem[];
  templates: EmailTemplateItem[];
  onClose: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[140px] px-3 py-2 text-sm text-foreground focus:outline-none',
      },
    },
  });

  const recipientCount = selectedReaders.length;
  const title =
    recipientCount === 1
      ? `Email to ${selectedReaders[0]?.name ?? 'user'}`
      : `Email to ${recipientCount} users`;

  const btnClass = (active: boolean) =>
    `rounded px-2 py-1 text-xs font-medium transition ${
      active ? 'bg-primary text-white' : 'text-foreground hover:bg-primary-soft hover:text-primary'
    }`;

  const loadTemplate = (t: EmailTemplateItem) => {
    setSubject(t.subject);
    editor?.commands.setContent(t.bodyHtml);
    setTemplatePickerOpen(false);
  };

  const send = async () => {
    if (!editor) return;
    setSending(true);
    setError(null);
    try {
      const readerIds = selectedReaders.map((r) => r.id);
      const result = await sendEmailToReaders(readerIds, subject.trim(), editor.getHTML());
      if (result.ok) {
        setSent(result.sent);
      } else {
        setError(result.error);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="border-border bg-card mx-4 w-full max-w-lg rounded-2xl border p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-foreground mb-3 text-base font-semibold">{title}</h3>

        {sent !== null ? (
          <div>
            <p className="text-foreground text-sm">Email sent to {sent} recipient(s).</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-button bg-primary hover:bg-primary-hover mt-4 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {templates.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTemplatePickerOpen((v) => !v)}
                    className="border-border text-muted-foreground hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    Use template
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {templatePickerOpen && (
                    <div className="border-border bg-card absolute top-full left-0 z-10 mt-1 w-64 rounded-xl border shadow-lg">
                      <ul className="max-h-56 overflow-y-auto py-1">
                        {templates.map((t) => (
                          <li key={t.key}>
                            <button
                              type="button"
                              onClick={() => loadTemplate(t)}
                              className="hover:bg-primary-soft w-full px-4 py-2 text-left"
                            >
                              <p className="text-foreground text-sm font-medium">
                                {t.name || t.key}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">{t.subject}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                autoFocus
                className="border-border bg-background text-foreground rounded-button focus:border-primary w-full border px-3 py-2 text-sm focus:outline-none"
              />
              <div className="border-border rounded-button overflow-hidden border">
                <div className="border-border flex items-center gap-0.5 border-b px-2 py-1">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor?.chain().focus().toggleBold().run();
                    }}
                    className={btnClass(editor?.isActive('bold') ?? false)}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor?.chain().focus().toggleItalic().run();
                    }}
                    className={btnClass(editor?.isActive('italic') ?? false)}
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor?.chain().focus().toggleStrike().run();
                    }}
                    className={btnClass(editor?.isActive('strike') ?? false)}
                  >
                    <s>S</s>
                  </button>
                  <div className="bg-border mx-1 h-4 w-px" />
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor?.chain().focus().toggleBulletList().run();
                    }}
                    className={btnClass(editor?.isActive('bulletList') ?? false)}
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor?.chain().focus().toggleOrderedList().run();
                    }}
                    className={btnClass(editor?.isActive('orderedList') ?? false)}
                  >
                    1. List
                  </button>
                </div>
                <EditorContent editor={editor} />
              </div>
            </div>
            {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sending || !subject.trim() || !editor || editor.isEmpty}
                onClick={() => void send()}
                className="rounded-button bg-primary hover:bg-primary-hover px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
