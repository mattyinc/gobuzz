"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  triggerClassName,
  ariaLabel,
}: {
  label?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  triggerClassName?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const fieldRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useLayoutEffect(() => {
    if (!open || !fieldRef.current) return;

    function updatePosition() {
      if (!fieldRef.current) return;
      const rect = fieldRef.current.getBoundingClientRect();
      const menuWidth = Math.max(rect.width, 180);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));

      setPosition({
        top: rect.bottom + 6,
        left,
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
      if (!fieldRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={fieldRef} className={cn("relative", className)}>
      {label && <p className="mb-2 text-[12px] font-semibold text-muted">{label}</p>}
      <button
        type="button"
        aria-label={ariaLabel ?? label}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (["ArrowDown", "Enter", " "].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-line-soft bg-bg px-3 text-left text-[13px] font-medium text-ink outline-none transition-[border-color,background-color,box-shadow] duration-200 hover:border-line hover:bg-raised focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25",
          triggerClassName
        )}
      >
        <span className="min-w-0 truncate">{selectedOption?.label ?? "Select"}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gold transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="fixed z-80 rounded-xl border border-line-soft bg-surface p-1 shadow-(--shadow-warm)"
          style={{
            top: position.top,
            left: position.left,
            minWidth: Math.max(position.width, 180),
          }}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel ?? label}
            className="max-h-72 overflow-auto rounded-lg outline-none"
          >
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium outline-none transition-colors hover:bg-raised focus-visible:bg-raised focus-visible:ring-2 focus-visible:ring-gold/25",
                    selected ? "bg-gold text-bg hover:bg-gold-bright" : "text-muted"
                  )}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      selected ? "text-bg" : "text-transparent"
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
