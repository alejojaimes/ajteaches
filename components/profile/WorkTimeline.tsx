'use client';

import { motion } from 'motion/react';

export type WorkEntry = {
  role: string;
  company: string;
  period: string;
};

type Props = {
  items: WorkEntry[];
};

export function WorkTimeline({ items }: Props) {
  return (
    <div className="relative pl-7">
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ transformOrigin: 'top' }}
        className="bg-border absolute top-1 bottom-1 left-[3px] w-px"
      />
      <ul className="space-y-5">
        {items.map((item, i) => (
          <motion.li
            key={`${item.company}-${item.role}`}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            className="relative"
          >
            <span className="bg-primary ring-background absolute top-1 -left-7 h-[7px] w-[7px] rounded-full ring-4" />
            <p className="text-foreground text-sm font-semibold">{item.role}</p>
            <p className="text-primary text-sm">{item.company}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{item.period}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
