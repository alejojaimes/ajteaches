'use client';

import { useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { parseVideoUrl } from '@/lib/video-embed';

export function VideoEmbedView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const url = String(node.attrs.url ?? '');
  const [editing, setEditing] = useState(!url);
  const [draft, setDraft] = useState(url);
  const [error, setError] = useState('');
  const focusOnMount = (el: HTMLInputElement | null) => el?.focus();

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      deleteNode();
      return;
    }
    if (!parseVideoUrl(trimmed)) {
      setError('Link no soportado. Usa YouTube, Vimeo o un archivo .mp4/.webm/.ogg directo.');
      return;
    }
    updateAttributes({ url: trimmed });
    setError('');
    setEditing(false);
  };

  const cancel = () => {
    if (!url) {
      deleteNode();
      return;
    }
    setDraft(url);
    setError('');
    setEditing(false);
  };

  if (editing) {
    return (
      <NodeViewWrapper className={`video-embed-editing ${selected ? 'math-node-selected' : ''}`}>
        <input
          ref={focusOnMount}
          type="url"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          onBlur={commit}
          placeholder="https://www.youtube.com/watch?v=..."
          className="video-embed-input"
        />
        {error && <p className="video-embed-error">{error}</p>}
      </NodeViewWrapper>
    );
  }

  const info = parseVideoUrl(url);

  return (
    <NodeViewWrapper className={`video-embed ${selected ? 'math-node-selected' : ''}`}>
      {info ? (
        <div className="video-embed-frame">
          {info.provider === 'file' ? (
            <video src={info.embedUrl} controls />
          ) : (
            <iframe
              src={info.embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>
      ) : (
        <p className="video-embed-error">Link de video inválido.</p>
      )}
      <button
        type="button"
        contentEditable={false}
        className="video-embed-edit-btn"
        onClick={() => {
          setDraft(url);
          setEditing(true);
        }}
      >
        Edit link
      </button>
    </NodeViewWrapper>
  );
}
