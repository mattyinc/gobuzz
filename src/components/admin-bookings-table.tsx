"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { FACILITIES, type FacilityId } from "@/lib/facilities";
import type { BookingRecord, BookingStatus } from "@/lib/booking-store";

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

function formatStatus(status: BookingStatus) {
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function AdminBookingsTable({ bookings }: { bookings: BookingRecord[] }) {
  const [rows, setRows] = useState(bookings);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(bookings.map((booking) => [booking.id, toDraft(booking)]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const active = rows.filter((booking) => ["confirmed", "checked-in"].includes(booking.status));
    return {
      bookings: rows.length,
      spots: active.reduce((sum, booking) => sum + booking.spots, 0),
      active: active.length,
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

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line-soft bg-surface px-5 py-4">
          <p className="text-[12px] font-semibold text-faint">Bookings</p>
          <p className="mt-1 text-2xl font-semibold">{totals.bookings}</p>
        </div>
        <div className="rounded-xl border border-line-soft bg-surface px-5 py-4">
          <p className="text-[12px] font-semibold text-faint">Active sessions</p>
          <p className="mt-1 text-2xl font-semibold">{totals.active}</p>
        </div>
        <div className="rounded-xl border border-line-soft bg-surface px-5 py-4">
          <p className="text-[12px] font-semibold text-faint">Active spots</p>
          <p className="mt-1 text-2xl font-semibold">{totals.spots}</p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-700 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-line-soft bg-surface">
        <table className="min-w-[1040px] w-full border-collapse text-left text-[14px]">
          <thead className="bg-raised text-[12px] text-faint">
            <tr>
              <th className="border-b border-line-soft px-4 py-3 font-semibold">Guest</th>
              <th className="border-b border-line-soft px-4 py-3 font-semibold">Experience</th>
              <th className="border-b border-line-soft px-4 py-3 font-semibold">Date</th>
              <th className="border-b border-line-soft px-4 py-3 font-semibold">Time</th>
              <th className="border-b border-line-soft px-4 py-3 font-semibold">Spots</th>
              <th className="border-b border-line-soft px-4 py-3 font-semibold">Status</th>
              <th className="border-b border-line-soft px-4 py-3 font-semibold">Notes</th>
              <th className="border-b border-line-soft px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted">
                  No bookings match this view.
                </td>
              </tr>
            )}

            {rows.map((booking) => {
              const draft = drafts[booking.id];
              const facility = FACILITIES[booking.facility as FacilityId];

              return (
                <tr key={booking.id} className="border-b border-line-soft last:border-b-0">
                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold">{booking.name}</p>
                    <p className="mt-1 text-[12px] text-muted">{booking.email}</p>
                    {booking.phone && <p className="mt-1 text-[12px] text-muted">{booking.phone}</p>}
                    <p className="mt-2 font-mono text-[12px] text-gold">{booking.code}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium">{facility?.name ?? booking.facility}</p>
                    <p className="mt-1 text-[12px] text-muted">{facility?.temperature}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(event) => updateDraft(booking.id, { date: event.target.value })}
                      className="h-10 rounded-lg border border-line-soft bg-bg px-3 text-[13px] outline-none focus:border-gold"
                      aria-label={`Date for ${booking.code}`}
                    />
                    <p className="mt-1 text-[12px] text-muted">{formatDate(draft.date)}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <input
                      type="time"
                      value={draft.start}
                      onChange={(event) => updateDraft(booking.id, { start: event.target.value })}
                      className="h-10 rounded-lg border border-line-soft bg-bg px-3 text-[13px] outline-none focus:border-gold"
                      aria-label={`Time for ${booking.code}`}
                    />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <input
                      type="number"
                      min={1}
                      max={facility?.capacity ?? 8}
                      value={draft.spots}
                      onChange={(event) =>
                        updateDraft(booking.id, { spots: Number(event.target.value) })
                      }
                      className="h-10 w-20 rounded-lg border border-line-soft bg-bg px-3 text-[13px] outline-none focus:border-gold"
                      aria-label={`Spots for ${booking.code}`}
                    />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        updateDraft(booking.id, { status: event.target.value as BookingStatus })
                      }
                      className="h-10 rounded-lg border border-line-soft bg-bg px-3 text-[13px] outline-none focus:border-gold"
                      aria-label={`Status for ${booking.code}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <textarea
                      value={draft.notes ?? ""}
                      onChange={(event) => updateDraft(booking.id, { notes: event.target.value })}
                      rows={2}
                      className="w-56 rounded-lg border border-line-soft bg-bg px-3 py-2 text-[13px] outline-none focus:border-gold"
                      placeholder="Internal note"
                      aria-label={`Notes for ${booking.code}`}
                    />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <button
                      type="button"
                      onClick={() => save(booking.id)}
                      disabled={savingId === booking.id}
                      className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-4 text-[13px] font-semibold text-bg transition-colors hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingId === booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : savedId === booking.id ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                      )}
                      {savedId === booking.id ? "Saved" : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
