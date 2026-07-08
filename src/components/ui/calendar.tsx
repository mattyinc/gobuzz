"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  mode?: "single";
  showOutsideDays?: boolean;
};

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function atNoonUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day, 12));
}

function normalizeDate(date: Date) {
  return atNoonUtc(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function monthStart(date: Date) {
  return atNoonUtc(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return atNoonUtc(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
}

function dateKey(date: Date) {
  return normalizeDate(date).toISOString().slice(0, 10);
}

function buildCalendarDays(visibleMonth: Date) {
  const firstDay = monthStart(visibleMonth);
  const gridStart = atNoonUtc(
    firstDay.getUTCFullYear(),
    firstDay.getUTCMonth(),
    1 - firstDay.getUTCDay()
  );

  return Array.from({ length: 42 }, (_, index) =>
    atNoonUtc(gridStart.getUTCFullYear(), gridStart.getUTCMonth(), gridStart.getUTCDate() + index)
  );
}

export function Calendar({
  selected,
  onSelect,
  className,
  showOutsideDays = true,
}: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(selected ?? new Date()));
  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedKey = selected ? dateKey(selected) : null;
  const todayKey = dateKey(new Date());
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(visibleMonth);

  return (
    <div className={cn("w-[18.5rem] select-none", className)}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-soft bg-bg text-muted outline-none transition-colors hover:border-line hover:bg-raised hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/25"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="min-w-0 flex-1 text-center text-[14px] font-semibold text-ink">
          {monthLabel}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-soft bg-bg text-muted outline-none transition-colors hover:border-line hover:bg-raised hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/25"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="flex h-7 items-center justify-center text-[11px] font-semibold text-faint"
          >
            {weekday}
          </div>
        ))}

        {days.map((date) => {
          const key = dateKey(date);
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;
          const isOutside = date.getUTCMonth() !== visibleMonth.getUTCMonth();

          if (isOutside && !showOutsideDays) {
            return <div key={key} className="h-9 w-9" aria-hidden="true" />;
          }

          return (
            <button
              key={key}
              type="button"
              aria-label={new Intl.DateTimeFormat("en-US", {
                dateStyle: "full",
                timeZone: "UTC",
              }).format(date)}
              aria-pressed={isSelected}
              onClick={() => onSelect?.(date)}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-semibold outline-none transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-gold/25",
                isSelected
                  ? "bg-gold text-bg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                  : "text-ink hover:bg-raised",
                isOutside && !isSelected && "text-faint opacity-50",
                isToday &&
                  !isSelected &&
                  "after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-gold"
              )}
            >
              {date.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
