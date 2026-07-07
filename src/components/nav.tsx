"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoFull } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/#method", label: "The Method" },
  { href: "/#why", label: "Why Go'Buzz" },
  { href: "/#facilities", label: "Facilities" },
  { href: "/#booking", label: "Booking" },
  { href: "/#membership", label: "Membership" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-line-soft bg-bg/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          aria-label="Go'Buzz Wellness — home"
          className="text-gold transition-colors duration-300 hover:text-gold-bright"
          onClick={() => setOpen(false)}
        >
          <LogoFull className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium tracking-[0.08em] text-muted transition-colors duration-300 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/book"
            className="hidden rounded-full bg-gold px-6 py-2.5 text-[13px] font-semibold tracking-[0.06em] text-bg transition-all duration-300 hover:bg-gold-bright sm:block"
          >
            Book a Session
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line-soft text-muted transition-colors hover:text-gold lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`grid overflow-hidden border-line-soft bg-bg/95 backdrop-blur-xl transition-all duration-400 lg:hidden ${
          open ? "grid-rows-[1fr] border-b" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <nav className="flex flex-col gap-1 px-6 py-4" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-medium text-muted transition-colors hover:bg-line-soft hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="mt-2 mb-3 rounded-full bg-gold px-6 py-3 text-center text-[14px] font-semibold text-bg transition-colors hover:bg-gold-bright"
            >
              Book a Session
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
