'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { ChevronDown, ChevronUp, Save, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import {
  upsertEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from '@/lib/actions/email-templates';

type PredefinedEntry = {
  key: string;
  name: string;
  label: string;
  description: string;
  defaultSubject: string;
  subject: string;
  bodyHtml: string;
  isSaved: boolean;
};

type CustomEntry = {
  key: string;
  name: string;
  subject: string;
  bodyHtml: string;
};

type Props = {
  predefined: PredefinedEntry[];
  custom: CustomEntry[];
};

export function EmailTemplatesEditor({ predefined, custom }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(predefined[0]?.key ?? null);
  const [customTemplates, setCustomTemplates] = useState<CustomEntry[]>(custom);
  const [creating, setCreating] = useState(false);

  const toggle = (key: string) => setOpenKey((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
          Automated emails
        </h2>
        <div className="space-y-3">
          {predefined.map((t) => (
            <PredefinedCard
              key={t.key}
              template={t}
              isOpen={openKey === t.key}
              onToggle={() => toggle(t.key)}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Custom templates
          </h2>
          {!creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="bg-primary-soft text-primary hover:bg-primary inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              New template
            </button>
          )}
        </div>

        {creating && (
          <CreateTemplateCard
            onCreated={(t) => {
              setCustomTemplates((prev) => [t, ...prev]);
              setCreating(false);
              setOpenKey(t.key);
            }}
            onCancel={() => setCreating(false)}
          />
        )}

        <div className="space-y-3">
          {customTemplates.map((t) => (
            <CustomCard
              key={t.key}
              template={t}
              isOpen={openKey === t.key}
              onToggle={() => toggle(t.key)}
              onDeleted={() => setCustomTemplates((prev) => prev.filter((c) => c.key !== t.key))}
            />
          ))}
          {customTemplates.length === 0 && !creating && (
            <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
              No custom templates yet. Create one to reuse when emailing readers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── shared toolbar ─────────────────────────────────────── */

function ToolbarBtn({
  active,
  onMouseDown,
  children,
}: {
  active: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      className={`rounded px-2 py-1 text-xs font-medium transition ${
        active
          ? 'bg-primary text-white'
          : 'text-foreground hover:bg-primary-soft hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  return (
    <div className="border-border flex items-center gap-0.5 border-b px-2 py-1.5">
      <ToolbarBtn
        active={editor.isActive('bold')}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
      >
        B
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive('italic')}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
      >
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive('strike')}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
      >
        <s>S</s>
      </ToolbarBtn>
      <div className="bg-border mx-1 h-4 w-px" />
      <ToolbarBtn
        active={editor.isActive('bulletList')}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
      >
        • List
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive('orderedList')}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
      >
        1. List
      </ToolbarBtn>
    </div>
  );
}

const editorClass =
  'prose prose-sm max-w-none min-h-[160px] px-3 py-3 text-sm text-foreground focus:outline-none';

/* ─── predefined card ───────────────────────────────────── */

function PredefinedCard({
  template,
  isOpen,
  onToggle,
}: {
  template: PredefinedEntry;
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
    editorProps: { attributes: { class: editorClass } },
  });

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    setError(null);
    try {
      await upsertEmailTemplate(template.key, template.name, subject, editor.getHTML());
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
              <EditorToolbar editor={editor} />
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

/* ─── custom template card ──────────────────────────────── */

function CustomCard({
  template,
  isOpen,
  onToggle,
  onDeleted,
}: {
  template: CustomEntry;
  isOpen: boolean;
  onToggle: () => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: template.bodyHtml || '',
    editorProps: { attributes: { class: editorClass } },
  });

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    setError(null);
    try {
      await updateEmailTemplate(template.key, name, subject, editor.getHTML());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteEmailTemplate(template.key);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
      setDeleting(false);
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
          <p className="text-foreground text-sm font-medium">{name || 'Untitled template'}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">{subject}</p>
        </div>
        {isOpen ? (
          <ChevronUp className="text-muted-foreground h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="border-border space-y-3 border-t px-5 pt-4 pb-5">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">Template name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly newsletter"
              className="border-border text-foreground focus:ring-primary w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1"
            />
          </div>
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
              <EditorToolbar editor={editor} />
              <EditorContent editor={editor} />
            </div>
            <p className="text-muted-foreground mt-1.5 text-xs">
              Use <code className="bg-primary-soft text-primary rounded px-1">{'{{name}}'}</code> to
              insert the reader&apos;s name.
            </p>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleDelete()}
              className="text-destructive hover:text-destructive/80 inline-flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-primary flex items-center gap-1 text-xs font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              <button
                type="button"
                disabled={saving || !name.trim() || !subject.trim() || !editor || editor.isEmpty}
                onClick={() => void handleSave()}
                className="rounded-button bg-primary hover:bg-primary-hover inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── create template inline form ───────────────────────── */

function CreateTemplateCard({
  onCreated,
  onCancel,
}: {
  onCreated: (t: CustomEntry) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: '',
    editorProps: { attributes: { class: editorClass } },
  });

  const handleCreate = async () => {
    if (!editor) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createEmailTemplate(name, subject, editor.getHTML());
      onCreated({
        key: created.key,
        name: created.name,
        subject: created.subject,
        bodyHtml: created.bodyHtml,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
      setSaving(false);
    }
  };

  return (
    <div className="border-primary bg-card mb-3 space-y-3 overflow-hidden rounded-xl border px-5 pt-4 pb-5">
      <p className="text-foreground text-sm font-medium">New template</p>
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">Template name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Monthly newsletter"
          autoFocus
          className="border-border text-foreground focus:ring-primary w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1"
        />
      </div>
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject…"
          className="border-border text-foreground focus:ring-primary w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1"
        />
      </div>
      <div>
        <label className="text-muted-foreground mb-1 block text-xs">Body</label>
        <div className="border-border overflow-hidden rounded-md border">
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>
        <p className="text-muted-foreground mt-1.5 text-xs">
          Use <code className="bg-primary-soft text-primary rounded px-1">{'{{name}}'}</code> to
          insert the reader&apos;s name.
        </p>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || !name.trim() || !subject.trim() || !editor || editor.isEmpty}
          onClick={() => void handleCreate()}
          className="rounded-button bg-primary hover:bg-primary-hover inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? 'Creating…' : 'Create template'}
        </button>
      </div>
    </div>
  );
}
