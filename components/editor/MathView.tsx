'use client';

import { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import katex from 'katex';

function renderKatex(latex: string, displayMode: boolean): string {
  if (!latex.trim()) return '';
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode });
  } catch {
    return '';
  }
}

export function MathView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const displayMode = node.type.name === 'mathBlock';
  const latex = String(node.attrs.latex ?? '');
  const [editing, setEditing] = useState(!latex);
  const [draft, setDraft] = useState(latex);
  const focusOnMount = (el: HTMLInputElement | HTMLTextAreaElement | null) => el?.focus();

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      deleteNode();
      return;
    }
    updateAttributes({ latex: trimmed });
    setEditing(false);
  };

  const cancel = () => {
    if (!latex) {
      deleteNode();
      return;
    }
    setDraft(latex);
    setEditing(false);
  };

  const wrapperClass = `${displayMode ? 'math-block' : 'math-inline'} ${selected ? 'math-node-selected' : ''}`;

  if (editing) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (displayMode ? e.metaKey || e.ctrlKey : true)) {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    };

    return (
      <NodeViewWrapper as={displayMode ? 'div' : 'span'} className={wrapperClass}>
        {displayMode ? (
          <textarea
            ref={focusOnMount}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            placeholder="\text{LaTeX}"
            rows={2}
            className="math-source-input"
          />
        ) : (
          <input
            ref={focusOnMount}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            placeholder="x^2"
            className="math-source-input"
          />
        )}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as={displayMode ? 'div' : 'span'} className={wrapperClass}>
      <span
        contentEditable={false}
        role="button"
        tabIndex={0}
        aria-label="Edit LaTeX formula"
        onClick={() => {
          setDraft(latex);
          setEditing(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setDraft(latex);
            setEditing(true);
          }
        }}
        dangerouslySetInnerHTML={{ __html: renderKatex(latex, displayMode) }}
      />
    </NodeViewWrapper>
  );
}
