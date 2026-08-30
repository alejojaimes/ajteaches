'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Copy, Check, Mail, ChevronDown, Eye, Send, CheckCircle2, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import {
  sendEmailToReaders,
  previewAdminMessage,
  sendTestAdminMessage,
} from '@/lib/actions/readers';
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
  ownerEmail: string | null;
  noEmailCount: number;
};

export function UsersList({ readers, templates, ownerEmail, noEmailCount }: Props) {
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
        <div className="flex items-center gap-3">
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
          {noEmailCount > 0 && (
            <span className="text-muted-foreground text-xs">
              {noEmailCount} user{noEmailCount === 1 ? '' : 's'} without an email can&apos;t be
              selected
            </span>
          )}
        </div>
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
          ownerEmail={ownerEmail}
          onClose={() => setComposeOpen(false)}
        />
      )}
    </div>
  );
}

function ComposeEmailDialog({
  selectedReaders,
  templates,
  ownerEmail,
  onClose,
}: {
  selectedReaders: ReaderListItem[];
  templates: EmailTemplateItem[];
  ownerEmail: string | null;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<number | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState(ownerEmail ?? '');
  const [testSending, setTestSending] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

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

  const openPreview = async () => {
    if (!editor) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const { html } = await previewAdminMessage(subject, editor.getHTML());
      setPreviewHtml(html);
      setPreviewOpen(true);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : 'Failed to render preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const sendTest = async () => {
    if (!editor) return;
    setTestSending(true);
    setTestError(null);
    try {
      const result = await sendTestAdminMessage(subject, editor.getHTML(), testEmail);
      if (result.ok) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 2500);
      } else {
        setTestError(result.error);
      }
    } finally {
      setTestSending(false);
    }
  };

  const noContent = !subject.trim() || !editor || editor.isEmpty;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="border-border bg-card mx-4 w-full max-w-lg rounded-2xl border p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-foreground mb-1 text-base font-semibold">{title}</h3>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {selectedReaders.slice(0, 6).map((reader) => (
            <div
              key={reader.id}
              className="border-border bg-background flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5"
              title={reader.email ?? reader.name}
            >
              <Avatar size="sm">
                {reader.avatar && <AvatarImage src={reader.avatar} alt={reader.name} />}
                <AvatarFallback className="bg-primary text-[9px] font-bold text-white">
                  {getInitials(reader.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-foreground max-w-[7rem] truncate text-xs">{reader.name}</span>
            </div>
          ))}
          {selectedReaders.length > 6 && (
            <span className="text-muted-foreground text-xs">
              +{selectedReaders.length - 6} more
            </span>
          )}
        </div>

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

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                disabled={noContent || previewLoading}
                onClick={() => void openPreview()}
                className="border-border text-foreground hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Eye className="h-3.5 w-3.5" />
                {previewLoading ? 'Loading…' : 'Preview'}
              </button>
              <button
                type="button"
                disabled={noContent}
                onClick={() => setTestOpen((v) => !v)}
                className="border-border text-foreground hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                Send test
              </button>
            </div>
            {previewError && <p className="text-destructive mt-1 text-xs">{previewError}</p>}

            {testOpen && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="border-border text-foreground focus:ring-primary flex-1 rounded-md border bg-transparent px-3 py-1.5 text-xs outline-none focus:ring-1"
                />
                <button
                  type="button"
                  disabled={testSending || noContent || !testEmail.trim()}
                  onClick={() => void sendTest()}
                  className="bg-primary hover:bg-primary-hover rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  {testSending ? 'Sending…' : 'Send'}
                </button>
                {testSent && (
                  <span className="text-primary flex items-center gap-1 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Sent
                  </span>
                )}
              </div>
            )}
            {testError && <p className="text-destructive mt-1 text-xs">{testError}</p>}

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
                disabled={sending || noContent}
                onClick={() => void send()}
                className="rounded-button bg-primary hover:bg-primary-hover px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </>
        )}

        {previewOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)}
          >
            <div
              className="border-border bg-card mx-4 w-full max-w-lg rounded-2xl border p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-foreground text-sm font-semibold">Preview</p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setPreviewOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <iframe
                srcDoc={previewHtml}
                sandbox=""
                title="Email preview"
                className="h-[420px] w-full rounded-md border bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
