'use client';

import { useEffect } from 'react';

export function CodeCopyInit() {
  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.code-copy-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.closest('.code-block-wrapper')?.querySelector('code');
        if (!code) return;
        void navigator.clipboard.writeText(code.innerText).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = 'Copy';
          }, 1500);
        });
      });
    });
  }, []);

  return null;
}
