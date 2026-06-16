'use client';

import { NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';

export function EmbedCardView({ node }: ReactNodeViewProps) {
  const url = (node.attrs['url'] as string) ?? '';
  const title = (node.attrs['title'] as string) ?? '';
  const description = (node.attrs['description'] as string) ?? '';
  const image = (node.attrs['image'] as string) ?? '';

  return (
    <NodeViewWrapper>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="embed-card"
        contentEditable={false}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title || 'Embed preview'} className="embed-card-image" />
        )}
        <div className="embed-card-body">
          {title && <p className="embed-card-title">{title}</p>}
          {description && <p className="embed-card-description">{description}</p>}
          <p className="embed-card-cta">Read post →</p>
        </div>
      </a>
    </NodeViewWrapper>
  );
}
