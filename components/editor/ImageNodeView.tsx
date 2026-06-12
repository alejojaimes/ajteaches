'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export function ImageNodeView({ node, selected }: NodeViewProps) {
  const src = String(node.attrs.src ?? '');
  const alt = String(node.attrs.alt ?? '');
  const credit = node.attrs.credit ? String(node.attrs.credit) : '';

  return (
    <NodeViewWrapper className="post-image-view">
      <figure className="post-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={selected ? 'ProseMirror-selectednode' : ''} />
        {credit && <figcaption className="image-credit">{credit}</figcaption>}
      </figure>
    </NodeViewWrapper>
  );
}
