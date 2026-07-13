"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { LogoFull } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function TeaserNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled
          ? "border-b border-line-soft bg-bg/88 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/teaser"
          aria-label="Go'Buzz teaser home"
          className="text-gold transition-colors hover:text-gold-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <LogoFull className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <a
            href="#invitation"
            className="group inline-flex h-11 items-center gap-2 rounded-full px-3 text-[12px] font-semibold text-ink transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:px-4 sm:text-[13px]"
          >
            Request invitation
            <ArrowDown className="h-3.5 w-3.5 text-gold transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
