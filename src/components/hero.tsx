"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "./logo";
import { TextReveal } from "./text-reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ minimal = false }: { minimal?: boolean }) {
  const { scrollY } = useScroll();
  // Ghost logo drifts upward as user scrolls
  const logoY = useTransform(scrollY, [0, 700], [0, -100]);
  const logoOpacity = useTransform(scrollY, [0, 400], [0.05, 0]);

  return (
    <section
      className={`relative flex items-center overflow-hidden ${
        minimal ? "min-h-[calc(100svh-2.5rem)]" : "min-h-svh"
      }`}
    >
      {/* warm ember glow, bottom left */}
      <div
        aria-hidden="true"
        className="drift absolute -bottom-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full opacity-70"
        style={{ background: "radial-gradient(circle, var(--glow) 0%, transparent 65%)" }}
      />

      {/* ghosted brand mark with parallax */}
      <motion.div
        aria-hidden="true"
        style={{ y: logoY, opacity: logoOpacity }}
        className="pointer-events-none absolute -right-[8%] top-1/2 hidden -translate-y-1/2 lg:block"
      >
        <LogoMark className="w-[58vw] text-gold" />
      </motion.div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-32 pb-20 lg:px-10">
        {/* eyebrow: letter-spacing expands on mount */}
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, letterSpacing: "0.06em" }}
          animate={{ opacity: 1, letterSpacing: "0.28em" }}
          transition={{ duration: 1.4, delay: 0.05, ease: EASE }}
        >
          Private Wellness Club — Addis Ababa
        </motion.p>

        <h1 className="display mt-8 text-[17vw] leading-[0.92] sm:text-[13vw] lg:text-[9.5rem]">
          <TextReveal delay={0.25}>Move.</TextReveal>
          <TextReveal className="pl-[8vw] lg:pl-36" delay={0.4}>
            Think.
          </TextReveal>
          <TextReveal className="italic text-gold" delay={0.55}>
            Recover.
          </TextReveal>
        </h1>

        {!minimal && (
          <motion.div
            className="mt-12 max-w-md"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
          >
            <p className="text-[17px] leading-relaxed text-muted">
              A club built around heat, cold, and stillness — saunas,
              ice baths, and space to reset in the heart of the city.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/book"
                className="btn-shimmer group flex h-13 items-center gap-2.5 rounded-full bg-gold px-8 text-[14px] font-semibold tracking-[0.04em] text-bg transition-all duration-300 active:scale-[0.97] hover:bg-gold-bright"
              >
                Book a Session
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="#method"
                className="flex h-13 items-center rounded-full border border-line px-8 text-[14px] font-medium text-ink transition-all duration-300 active:scale-[0.97] hover:border-gold hover:text-gold"
              >
                The Method
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
