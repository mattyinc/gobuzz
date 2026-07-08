"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { motion, useInView } from "motion/react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** stagger delay in ms */
  delay?: number;
};

const TAG_MAP: Partial<Record<string, ElementType>> = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  span: motion.span,
  p: motion.p,
  ul: motion.ul,
  li: motion.li,
};

/** Scroll-triggered reveal: fades, rises, and scales up with spring physics. */
export function Reveal({ children, as = "div", className = "", delay = 0 }: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const MotionEl = TAG_MAP[as as string] ?? motion.div;

  return (
    <MotionEl
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        type: "spring",
        stiffness: 52,
        damping: 20,
        delay: delay / 1000,
      }}
    >
      {children}
    </MotionEl>
  );
}
