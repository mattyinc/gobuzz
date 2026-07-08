"use client";

import { motion } from "motion/react";

export function MethodTagList({ tags }: { tags: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2.5">
      {tags.map((t, ti) => (
        <motion.li
          key={t}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 + ti * 0.09, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-full border border-line-soft px-4 py-1.5 text-[12px] font-medium tracking-[0.08em] text-faint uppercase"
        >
          {t}
        </motion.li>
      ))}
    </ul>
  );
}
