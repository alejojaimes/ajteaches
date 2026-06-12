'use client';

import { useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

const MIN_WIDTH_PERCENT = 20;

export function ImageNodeView({ node, selected, updateAttributes }: NodeViewProps) {
  const figureRef = useRef<HTMLElement>(null);
  const src = String(node.attrs.src ?? '');
  const alt = String(node.attrs.alt ?? '');
  const credit = node.attrs.credit ? String(node.attrs.credit) : '';
  const width = typeof node.attrs.width === 'number' ? node.attrs.width : 100;

  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const figure = figureRef.current;
    const container = figure?.parentElement;
    if (!figure || !container) return;

    const containerWidth = container.getBoundingClientRect().width;
    const startWidth = figure.getBoundingClientRect().width;
    const startX = e.clientX;

    const nextWidthPercent = (clientX: number) => {
      const delta = clientX - startX;
      const widthPx = Math.min(
        containerWidth,
        Math.max((containerWidth * MIN_WIDTH_PERCENT) / 100, startWidth + delta)
      );
      return Math.round((widthPx / containerWidth) * 100);
    };

    const onMove = (moveEvent: PointerEvent) => {
      figure.style.width = `${nextWidthPercent(moveEvent.clientX)}%`;
    };

    const onUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      updateAttributes({ width: nextWidthPercent(upEvent.clientX) });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <NodeViewWrapper className="post-image-view">
      <figure ref={figureRef} className="post-image" style={{ width: `${width}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={selected ? 'ProseMirror-selectednode' : ''} />
        {credit && <figcaption className="image-credit">{credit}</figcaption>}
        {selected && (
          <div
            className="image-resize-handle"
            onPointerDown={handleResizeStart}
            title="Drag to resize"
          />
        )}
      </figure>
    </NodeViewWrapper>
  );
}
