"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { SelectField, type SelectOption } from "@/components/ui/select-field";

const statusOptions = [
  "all",
  "confirmed",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
] as const;

export type StatusFilter = (typeof statusOptions)[number];

export function formatStatus(status: StatusFilter) {
  if (status === "all") return "All";
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeStatus(value: string | undefined): StatusFilter {
  return statusOptions.includes(value as StatusFilter) ? (value as StatusFilter) : "all";
}

const options: SelectOption<StatusFilter>[] = statusOptions.map((status) => ({
  value: status,
  label: formatStatus(status),
}));

export function AdminBookingsFilters({
  selectedDate,
  selectedStatus,
}: {
  selectedDate: string | null;
  selectedStatus: StatusFilter;
}) {
  const router = useRouter();
  const [date, setDate] = useState<string | null>(selectedDate);
  const [status, setStatus] = useState<StatusFilter>(selectedStatus);
  const [isPending, startTransition] = useTransition();

  function applyFilters() {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (status !== "all") params.set("status", status);

    startTransition(() => {
      router.push(`/admin/bookings${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }

  return (
    <div className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-line-soft bg-surface p-4">
      <DatePickerField
        label="Date - empty shows all upcoming"
        value={date}
        onChange={setDate}
        allowClear
        placeholder="All upcoming"
        className="w-64"
      />
      <SelectField
        label="Status"
        value={status}
        options={options}
        onChange={setStatus}
        className="w-48"
      />
      <button
        type="button"
        onClick={applyFilters}
        disabled={isPending}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-gold px-5 text-[14px] font-semibold text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Filter
      </button>
    </div>
  );
}
