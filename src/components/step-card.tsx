"use client";

import { motion } from "motion/react";

type StepCardProps = {
  n: string;
  title: string;
  copy: string;
};

export function StepCard({ n, title, copy }: StepCardProps) {
  return (
    <motion.div
      className="h-full rounded-2xl border border-line-soft bg-raised p-7"
      whileHover={{
        scale: 1.02,
        rotateX: -2,
        rotateY: 3,
        transition: { type: "spring", stiffness: 280, damping: 20 },
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line font-serif text-lg text-gold">
        {n}
      </span>
      <h3 className="mt-5 text-[16px] font-semibold">{title}</h3>
      <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{copy}</p>
    </motion.div>
  );
}
