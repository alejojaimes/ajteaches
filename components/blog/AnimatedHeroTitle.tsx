'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  prefix: string;
  words: string[];
};

const ROTATE_INTERVAL_MS = 2800;

export function AnimatedHeroTitle({ prefix, words }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <h1 className="text-foreground mb-3 text-4xl font-bold sm:text-5xl">
      <span>{prefix}</span>
      <span className="from-primary to-accent relative inline-block bg-gradient-to-r bg-clip-text text-transparent">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="inline-block"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </h1>
  );
}
