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
          const label = btn.querySelector('.code-copy-label');
          if (label) label.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            if (label) label.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1500);
        });
      });
    });
  }, []);

  return null;
}
