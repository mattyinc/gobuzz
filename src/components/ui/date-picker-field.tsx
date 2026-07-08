"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

function toDate(value: string | null | undefined) {
  return value ? new Date(`${value}T12:00:00Z`) : undefined;
}

function toDateString(date: Date | undefined) {
  return date?.toISOString().slice(0, 10) ?? "";
}

function formatDisplay(value: string | null | undefined, placeholder: string) {
  if (!value) return placeholder;

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Select date",
  allowClear = false,
  className,
  buttonClassName,
  ariaLabel,
}: {
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return;

    function updatePosition() {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const menuWidth = 320;
      setPosition({
        top: rect.bottom + 6,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8)),
        width: rect.width,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {label && <p className="mb-2 text-[12px] font-semibold text-muted">{label}</p>}
      <div className="relative">
        <button
          type="button"
          aria-label={ariaLabel ?? label ?? placeholder}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-line-soft bg-bg px-3 text-left text-[13px] font-medium text-ink outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-line hover:bg-raised focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25",
            allowClear && value && "pr-16",
            !value && "text-muted",
            buttonClassName
          )}
        >
          <span>{formatDisplay(value, placeholder)}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
        </button>
        {allowClear && value && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={() => onChange(null)}
            className="absolute right-9 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/25"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={popoverRef}
          className="fixed z-80 rounded-xl border border-line-soft bg-surface p-3 shadow-(--shadow-warm)"
          style={{
            top: position.top,
            left: position.left,
            minWidth: Math.max(position.width, 320),
          }}
        >
          <Calendar
            mode="single"
            selected={toDate(value)}
            onSelect={(date) => {
              onChange(toDateString(date) || null);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
