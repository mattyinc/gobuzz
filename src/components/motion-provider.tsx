"use client";

import { MotionConfig } from "motion/react";

/**
 * reducedMotion="user" makes every motion.* component in the tree respect
 * the OS-level prefers-reduced-motion setting automatically (transform/layout
 * animations are skipped, opacity crossfades still play).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
