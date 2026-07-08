"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, animate, useInView } from "motion/react";

const ECG = "M0 100 H480 C520 100 540 92 556 84 L576 122 L604 18 L634 168 L662 62 L682 112 C700 101 716 100 736 100 H900";

/**
 * Animated ECG stroke echoing the pulse in the Go'Buzz logotype.
 * Draws once when it scrolls into view — no loop.
 * Decorative — hidden from assistive tech.
 */
export function PulseLine({
  className = "",
}: {
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathLength = useMotionValue(0);
  const isInView = useInView(svgRef, { once: true, margin: "0px 0px -40px 0px" });

  useEffect(() => {
    if (!isInView) return;
    animate(pathLength, 1, {
      duration: 2.5,
      delay: 0.15,
      ease: [0.65, 0, 0.35, 1],
    });
  }, [isInView, pathLength]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 900 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="pl-glow" x="-10%" y="-80%" width="120%" height="360%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d={ECG}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pl-glow)"
        style={{ pathLength }}
      />
    </svg>
  );
}
