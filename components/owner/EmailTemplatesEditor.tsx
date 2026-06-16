'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { ChevronDown, ChevronUp, Save, CheckCircle2 } from 'lucide-react';
import { upsertEmailTemplate } from '@/lib/actions/email-templates';
import type { EmailTemplateKey } from '@/lib/actions/email-templates';

type TemplateEntry = {
  key: EmailTemplateKey;
  label: string;
  description: string;
  defaultSubject: string;
  subject: string;
  bodyHtml: string;
  isSaved: boolean;
};

type Props = {
  templates: TemplateEntry[];
};

export function EmailTemplatesEditor({ templates }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(templates[0]?.key ?? null);

  return (
    <div className="space-y-3">
      {templates.map((t) => (
        <TemplateCard
          key={t.key}
          template={t}
          isOpen={openKey === t.key}
          onToggle={() => setOpenKey((prev) => (prev === t.key ? null : t.key))}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  template,
  isOpen,
  onToggle,
}: {
  template: TemplateEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [subject, setSubject] = useState(template.subject);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: template.bodyHtml || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[160px] px-3 py-3 text-sm text-foreground focus:outline-none',
      },
    },
  });

  const btnClass = (active: boolean) =>
    `rounded px-2 py-1 text-xs font-medium transition ${
      active ? 'bg-primary text-white' : 'text-foreground hover:bg-primary-soft hover:text-primary'
    }`;

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    setError(null);
    try {
      await upsertEmailTemplate(template.key, subject, editor.getHTML());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-foreground text-sm font-medium">{template.label}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">{template.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {template.isSaved && !isOpen && (
            <span className="rounded-badge bg-primary-soft text-primary px-2 py-0.5 text-xs font-medium">
              Custom
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="text-muted-foreground h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-border space-y-3 border-t px-5 pt-4 pb-5">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border-border text-foreground focus:ring-primary w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs">Body</label>
            <div className="border-border overflow-hidden rounded-md border">
              <div className="border-border flex items-center gap-0.5 border-b px-2 py-1.5">
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
            <p className="text-muted-foreground mt-1.5 text-xs">
              Use <code className="bg-primary-soft text-primary rounded px-1">{'{{name}}'}</code> to
              insert the reader&apos;s name.
            </p>
          </div>

          {error && <p className="text-destructive text-xs">{error}</p>}

          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="text-primary flex items-center gap-1 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </span>
            )}
            <button
              type="button"
              disabled={saving || !subject.trim() || !editor || editor.isEmpty}
              onClick={() => void handleSave()}
              className="rounded-button bg-primary hover:bg-primary-hover inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save template'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
