'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  if (resolvedTheme === undefined) {
    return <div className="size-9" aria-hidden />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-muted-foreground hover:text-foreground hover:bg-muted relative flex size-9 items-center justify-center overflow-hidden rounded-full transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
