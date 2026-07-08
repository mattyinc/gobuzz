"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";

type TextRevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** seconds — base delay before the first word */
  delay?: number;
};

/**
 * Curtain-mask reveal per word: each word slides up from behind a hard clip,
 * with a staggered delay and a slight de-rotation for a luxury entrance feel.
 */
export function TextReveal({ children, as: Tag = "span", className = "", delay = 0 }: TextRevealProps) {
  const text = typeof children === "string" ? children : String(children);
  const words = text.split(" ");

  return (
    <Tag className={`block overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "115%", rotate: 4 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{
              duration: 1,
              delay: delay + i * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
