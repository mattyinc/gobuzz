"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { SelectField, type SelectOption } from "@/components/ui/select-field";
import { statusFilterOptions, type StatusFilter } from "@/lib/booking-status";

const options: SelectOption<StatusFilter>[] = statusFilterOptions;

export function AdminBookingsFilters({
  selectedDate,
  selectedStatus,
  selectedQuery,
}: {
  selectedDate: string | null;
  selectedStatus: StatusFilter;
  selectedQuery: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState<string | null>(selectedDate);
  const [status, setStatus] = useState<StatusFilter>(selectedStatus);
  const [query, setQuery] = useState(selectedQuery);
  const [isPending, startTransition] = useTransition();
  const hasFilters = Boolean(selectedDate || selectedStatus !== "all" || selectedQuery);

  function applyFilters(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (status !== "all") params.set("status", status);
    if (query.trim()) params.set("q", query.trim());

    startTransition(() => {
      router.push(`/admin/bookings${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }

  return (
    <form onSubmit={applyFilters} className="border-y border-line-soft py-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_200px_180px_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-muted">Find a booking</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Guest, email, phone, or code"
              className="h-10 w-full rounded-xl border border-line-soft bg-surface pl-10 pr-3 text-[13px] text-ink outline-none transition-colors placeholder:text-faint hover:border-line focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </span>
        </label>
        <DatePickerField
          label="Service date"
          value={date}
          onChange={setDate}
          allowClear
          placeholder="All upcoming dates"
          className="w-full"
          buttonClassName="bg-surface"
        />
        <SelectField
          label="Booking status"
          value={status}
          options={options}
          onChange={setStatus}
          className="w-full"
          triggerClassName="bg-surface"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-4 text-[13px] font-semibold text-bg transition-colors hover:bg-gold-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
            Apply
          </button>
          {hasFilters && (
            <Link
              href="/admin/bookings"
              aria-label="Clear filters"
              title="Clear filters"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line-soft text-muted transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
