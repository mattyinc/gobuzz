"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const INTERACTIVE = 'a, button, [role="button"], label, select, input, textarea';

/**
 * Gold ring cursor.
 * - Position: direct style.transform on rAF — zero React re-renders, GPU layer.
 * - Hover: CSS custom property → scale transition, no layout reflow.
 * - Only active on fine-pointer (desktop) devices.
 */
export function Cursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const disabled = pathname.startsWith("/admin");

  useEffect(() => {
    if (disabled) {
      document.documentElement.classList.remove("has-cursor");
      return;
    }
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("has-cursor");

    const setHover = (on: boolean) => {
      const el = innerRef.current;
      if (!el) return;
      el.style.setProperty("--cs", on ? "2.4" : "1");
      el.style.setProperty("--co", on ? "0.12" : "0");
    };

    const onMove = (e: MouseEvent) => {
      const el = outerRef.current;
      if (!el) return;
      el.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    };

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest(INTERACTIVE)) setHover(true);
    };
    const onOut = (e: MouseEvent) => {
      if (!(e.relatedTarget as Element | null)?.closest(INTERACTIVE)) setHover(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <div
      ref={outerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        willChange: "transform",
      }}
    >
      <div
        ref={innerRef}
        style={
          {
            width: 18,
            height: 18,
            marginTop: -9,
            marginLeft: -9,
            borderRadius: "50%",
            border: "1.5px solid var(--gold)",
            backgroundColor: "rgba(201,168,76,var(--co,0))",
            transform: "scale(var(--cs,1))",
            transition: "transform 0.22s ease, background-color 0.22s ease",
            willChange: "transform",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
