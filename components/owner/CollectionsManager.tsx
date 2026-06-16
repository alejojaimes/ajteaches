'use client';

import { useState } from 'react';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { createCollection, renameCollection, deleteCollection } from '@/lib/actions/collections';
import type { CollectionListItem } from '@/lib/actions/collections';

type Props = {
  initialCollections: CollectionListItem[];
};

export function CollectionsManager({ initialCollections }: Props) {
  const [collections, setCollections] = useState(initialCollections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parents = collections.filter((c) => !c.parentId);
  const children = (parentId: string) => collections.filter((c) => c.parentId === parentId);

  const startEdit = (c: CollectionListItem) => {
    setEditingId(c.id);
    setEditName(c.name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (id: string) => {
    try {
      const updated = await renameCollection(id, editName);
      setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to rename');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Posts in this collection will be unassigned.`)) return;
    try {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await createCollection(newName.trim(), newParentId || null);
      setCollections((prev) => [...prev, created]);
      setNewName('');
      setNewParentId('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const rowClass = 'flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5';
  const btnIcon = 'rounded p-1 text-muted-foreground hover:text-foreground transition-colors';

  const CollectionRow = ({ c, indent = false }: { c: CollectionListItem; indent?: boolean }) => (
    <div className={`${rowClass} ${indent ? 'ml-6' : ''}`}>
      {editingId === c.id ? (
        <>
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void saveEdit(c.id);
              if (e.key === 'Escape') cancelEdit();
            }}
            className="border-border focus:ring-primary min-w-0 flex-1 rounded border bg-transparent px-2 py-0.5 text-sm outline-none focus:ring-1"
          />
          <button type="button" onClick={() => void saveEdit(c.id)} className={btnIcon}>
            <Check className="h-4 w-4 text-green-600" />
          </button>
          <button type="button" onClick={cancelEdit} className={btnIcon}>
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
            {indent && <span className="text-muted-foreground mr-1">↳</span>}
            {c.name}
          </span>
          <button type="button" onClick={() => startEdit(c)} className={btnIcon}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => void handleDelete(c.id, c.name)}
            className={`${btnIcon} hover:text-destructive`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Create new */}
      <div className="border-border bg-card rounded-xl border p-4">
        <p className="text-foreground mb-3 text-sm font-medium">New collection</p>
        <div className="space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleCreate();
            }}
            placeholder="Collection name"
            className="border-border text-foreground focus:ring-primary w-full rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-1"
          />
          <select
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value)}
            className="border-border text-foreground focus:ring-primary w-full rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-1"
          >
            <option value="">Top-level (no parent)</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {error && <p className="text-destructive text-xs">{error}</p>}
          <button
            type="button"
            disabled={creating || !newName.trim()}
            onClick={() => void handleCreate()}
            className="rounded-button bg-primary hover:bg-primary-hover inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {/* List */}
      {collections.length === 0 ? (
        <p className="text-muted-foreground text-sm">No collections yet.</p>
      ) : (
        <div className="space-y-2">
          {parents.map((parent) => (
            <div key={parent.id} className="space-y-1.5">
              <CollectionRow c={parent} />
              {children(parent.id).map((child) => (
                <CollectionRow key={child.id} c={child} indent />
              ))}
            </div>
          ))}
          {collections
            .filter((c) => c.parentId && !parents.find((p) => p.id === c.parentId))
            .map((orphan) => (
              <CollectionRow key={orphan.id} c={orphan} />
            ))}
        </div>
      )}
    </div>
  );
}
