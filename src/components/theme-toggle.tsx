"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_CHANGE_EVENT = "gobuzz-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getThemeSnapshot, () => false);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gobuzz-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line-soft text-muted transition-colors duration-300 hover:border-line hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        className
      )}
    >
      <Sun
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
          isDark === false ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
          isDark !== false ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"
        }`}
      />
    </button>
  );
}
