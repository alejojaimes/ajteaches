'use client';

import { useEffect, useState } from 'react';

type LightboxImage = { src: string; alt: string; credit: string };

export function ImageLightbox() {
  const [image, setImage] = useState<LightboxImage | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const img = target.closest('.tiptap-editor figure.post-image img') as HTMLImageElement | null;
      if (!img) return;
      const caption = img.closest('figure')?.querySelector('figcaption')?.textContent ?? '';
      setImage({ src: img.src, alt: img.alt, credit: caption });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!image) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImage(null);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [image]);

  if (!image) return null;

  return (
    <div className="image-lightbox-overlay" onClick={() => setImage(null)}>
      <button
        type="button"
        className="image-lightbox-close"
        aria-label="Close"
        onClick={() => setImage(null)}
      >
        ✕
      </button>
      <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} />
        <div className="image-lightbox-footer">
          {image.credit && <span>{image.credit}</span>}
          <a
            href={image.src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="image-lightbox-download"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
