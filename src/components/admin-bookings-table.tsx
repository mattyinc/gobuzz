"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { SelectField, type SelectOption } from "@/components/ui/select-field";
import { formatStatus } from "@/lib/booking-status";
import { FACILITIES, slotsForDate, type FacilityId } from "@/lib/facilities";
import type { BookingRecord, BookingStatus } from "@/lib/booking-store";
import { cn } from "@/lib/utils";

const statuses: BookingStatus[] = [
  "confirmed",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
];

type Draft = Pick<BookingRecord, "date" | "start" | "spots" | "status" | "notes">;

function toDraft(booking: BookingRecord): Draft {
  return {
    date: booking.date,
    start: booking.start,
    spots: booking.spots,
    status: booking.status,
    notes: booking.notes ?? "",
  };
}

const statusOptions: SelectOption<BookingStatus>[] = statuses.map((status) => ({
  value: status,
  label: formatStatus(status),
}));

function timeOptions(facilityId: FacilityId, date: string, currentStart: string) {
  const facility = FACILITIES[facilityId];
  const starts = slotsForDate(facility, date);
  const options = starts.includes(currentStart) ? starts : [currentStart, ...starts];

  return options.map((start) => ({
    value: start,
    label: `${start} (${facility.duration} min)`,
  }));
}

export function AdminBookingsTable({ bookings }: { bookings: BookingRecord[] }) {
  const [rows, setRows] = useState(bookings);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(bookings.map((booking) => [booking.id, toDraft(booking)]))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const active = rows.filter((booking) => ["confirmed", "checked-in"].includes(booking.status));
    return {
      bookings: rows.length,
      spots: active.reduce((sum, booking) => sum + booking.spots, 0),
      checkedIn: rows.filter((booking) => booking.status === "checked-in").length,
    };
  }, [rows]);

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
    setSavedId(null);
  }

  function isDirty(booking: BookingRecord) {
    return JSON.stringify(drafts[booking.id]) !== JSON.stringify(toDraft(booking));
  }

  async function save(id: string) {
    setSavingId(id);
    setError(null);
    setSavedId(null);

    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(drafts[id]),
    });

    const data = await response.json();
    setSavingId(null);

    if (!response.ok) {
      setError(data.error ?? "Could not save booking");
      return;
    }

    setRows((current) =>
      current.map((booking) => (booking.id === id ? data.booking : booking))
    );
    setDrafts((current) => ({
      ...current,
      [id]: toDraft(data.booking),
    }));
    setSavedId(id);
  }

  async function remove(id: string, code: string) {
    if (!window.confirm(`Delete booking ${code}? This cannot be undone.`)) return;

    setDeletingId(id);
    setError(null);

    const response = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Could not delete booking");
      return;
    }

    setRows((current) => current.filter((booking) => booking.id !== id));
    setDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setExpandedId(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[17px] font-semibold">Booking ledger</h2>
          <p className="mt-1 text-[12px] text-muted">
            {totals.bookings} {totals.bookings === 1 ? "booking" : "bookings"} in this view
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gold" aria-hidden="true" />{totals.spots} active spots</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />{totals.checkedIn} checked in</span>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-700 dark:text-red-200">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-semibold underline underline-offset-2">Dismiss</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line-soft bg-surface">
        <div className="hidden grid-cols-[minmax(190px,1.2fr)_minmax(210px,1fr)_100px_124px_40px] gap-4 border-b border-line-soft bg-raised px-4 py-3 text-[10px] font-semibold text-faint md:grid">
          <span>Guest</span>
          <span>Session</span>
          <span>Spots</span>
          <span>Status</span>
          <span className="sr-only">Actions</span>
        </div>

        {rows.length === 0 && (
          <div className="px-5 py-14 text-center">
            <SearchEmptyIcon />
            <p className="mt-4 text-[14px] font-semibold">No bookings found</p>
            <p className="mt-1 text-[12px] text-muted">Try clearing a filter or searching with a booking code.</p>
          </div>
        )}

        {rows.map((booking) => {
          const draft = drafts[booking.id];
          const facility = FACILITIES[booking.facility];
          const expanded = expandedId === booking.id;
          const dirty = isDirty(booking);

          return (
            <article key={booking.id} className="border-b border-line-soft last:border-b-0">
              <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(190px,1.2fr)_minmax(210px,1fr)_100px_124px_40px] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-semibold">{booking.name}</p>
                    <span className="font-mono text-[10px] font-semibold text-gold">{booking.code}</span>
                  </div>
                  <div className="mt-1.5 flex min-w-0 items-center gap-3 text-[11px] text-muted">
                    <span className="flex min-w-0 items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" aria-hidden="true" />{booking.email}</span>
                    {booking.phone && <span className="hidden items-center gap-1.5 lg:flex"><Phone className="h-3 w-3" aria-hidden="true" />{booking.phone}</span>}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-medium">{facility.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    {formatDate(booking.date)} at <span className="font-semibold tabular-nums text-ink">{booking.start}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between md:block">
                  <span className="text-[11px] text-faint md:hidden">Spots</span>
                  <span className="text-[13px] font-semibold tabular-nums">{booking.spots} / {facility.capacity}</span>
                </div>

                <div className="flex items-center justify-between gap-3 md:block">
                  <span className="text-[11px] text-faint md:hidden">Status</span>
                  <BookingStatusBadge status={booking.status} />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExpandedId(expanded ? null : booking.id);
                    setSavedId(null);
                  }}
                  aria-expanded={expanded}
                  aria-label={expanded ? `Close ${booking.code}` : `Edit ${booking.code}`}
                  title={expanded ? "Close editor" : "Edit booking"}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center justify-self-end rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                    expanded ? "border-gold bg-gold text-bg" : "border-line-soft text-muted hover:border-gold hover:text-gold"
                  )}
                >
                  {expanded ? <ChevronDown className="h-4 w-4 rotate-180" aria-hidden="true" /> : <Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              </div>

              {expanded && (
                <div className="border-t border-line-soft bg-raised px-4 py-5 sm:px-5">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold">Edit {booking.code}</p>
                      <p className="mt-0.5 text-[11px] text-muted">Changes stay private until you save.</p>
                    </div>
                    {dirty && <span className="rounded-full bg-gold/12 px-2.5 py-1 text-[10px] font-semibold text-gold">Unsaved changes</span>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(170px,0.9fr)_minmax(170px,0.9fr)_100px_minmax(160px,0.9fr)_minmax(220px,1.4fr)]">
                    <DatePickerField
                      label="Date"
                      value={draft.date}
                      onChange={(nextDate) => {
                        if (nextDate) updateDraft(booking.id, { date: nextDate });
                      }}
                      className="w-full"
                      buttonClassName="bg-surface"
                      ariaLabel={`Date for ${booking.code}`}
                    />
                    <SelectField
                      label="Start time"
                      value={draft.start}
                      options={timeOptions(booking.facility, draft.date, draft.start)}
                      onChange={(start) => updateDraft(booking.id, { start })}
                      className="w-full"
                      triggerClassName="bg-surface"
                      ariaLabel={`Time for ${booking.code}`}
                    />
                    <label className="block">
                      <span className="mb-2 block text-[12px] font-semibold text-muted">Spots</span>
                      <input
                        type="number"
                        min={1}
                        max={facility.capacity}
                        value={draft.spots}
                        onChange={(event) => updateDraft(booking.id, { spots: Number(event.target.value) })}
                        className="h-10 w-full rounded-xl border border-line-soft bg-surface px-3 text-[13px] font-medium outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                        aria-label={`Spots for ${booking.code}`}
                      />
                    </label>
                    <SelectField
                      label="Status"
                      value={draft.status}
                      options={statusOptions}
                      onChange={(status) => updateDraft(booking.id, { status })}
                      className="w-full"
                      triggerClassName="bg-surface"
                      ariaLabel={`Status for ${booking.code}`}
                    />
                    <label className="block sm:col-span-2 xl:col-span-1">
                      <span className="mb-2 block text-[12px] font-semibold text-muted">Internal note</span>
                      <input
                        type="text"
                        value={draft.notes ?? ""}
                        onChange={(event) => updateDraft(booking.id, { notes: event.target.value })}
                        className="h-10 w-full rounded-xl border border-line-soft bg-surface px-3 text-[13px] outline-none transition-colors placeholder:text-faint focus:border-gold focus:ring-2 focus:ring-gold/20"
                        placeholder="Add a note for the team"
                        aria-label={`Notes for ${booking.code}`}
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
                    <button
                      type="button"
                      onClick={() => remove(booking.id, booking.code)}
                      disabled={deletingId === booking.id || savingId === booking.id}
                      className="flex h-9 items-center gap-2 rounded-full px-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300"
                    >
                      {deletingId === booking.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      Delete booking
                    </button>
                    <div className="flex items-center gap-3">
                      {savedId === booking.id && <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"><Check className="h-3.5 w-3.5" aria-hidden="true" />Saved</span>}
                      <button
                        type="button"
                        onClick={() => save(booking.id)}
                        disabled={!dirty || savingId === booking.id || deletingId === booking.id}
                        className="flex h-10 items-center justify-center gap-2 rounded-full bg-gold px-5 text-[13px] font-semibold text-bg transition-colors hover:bg-gold-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {savingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                        Save changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function SearchEmptyIcon() {
  return (
    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
      <Users className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}
