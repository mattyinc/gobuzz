import type { Metadata } from "next";
import Link from "next/link";
import { Waves } from "lucide-react";
import { bookedBySlot } from "@/lib/booking-store";
import { FACILITIES, FACILITY_IDS, bookableDates, slotsForDate } from "@/lib/facilities";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Facilities - Go'Buzz Admin",
  description: "Slot-by-slot availability across Go'Buzz Wellness facilities.",
};

export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const dates = bookableDates();
  const selectedDate = params.date && dates.includes(params.date) ? params.date : dates[0];

  const takenByFacility = await Promise.all(
    FACILITY_IDS.map((id) => bookedBySlot(id, selectedDate))
  );

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Facilities</h2>
        <p className="mt-1 text-[14px] text-muted">
          Slot-by-slot occupancy for a chosen day — spot gaps at a glance.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto rounded-xl border border-line-soft bg-surface p-3">
        {dates.map((date) => (
          <Link
            key={date}
            href={`/admin/facilities?date=${date}`}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors",
              date === selectedDate
                ? "bg-gold text-bg"
                : "border border-line-soft text-muted hover:border-line hover:text-ink"
            )}
          >
            {formatDate(date)}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {FACILITY_IDS.map((id, index) => {
          const facility = FACILITIES[id];
          const slots = slotsForDate(facility, selectedDate);
          const taken = takenByFacility[index];

          return (
            <section key={id} className="rounded-2xl border border-line-soft bg-surface p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Waves className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold">{facility.name}</p>
                  <p className="text-[12px] text-muted">
                    {facility.capacity} spot{facility.capacity === 1 ? "" : "s"} ·{" "}
                    {facility.duration} min
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-1.5">
                {slots.map((start) => {
                  const booked = taken.get(start) ?? 0;
                  const remaining = facility.capacity - booked;
                  const full = remaining <= 0;

                  return (
                    <div
                      key={start}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-3 py-2 text-[13px]",
                        full
                          ? "border-line-soft bg-raised text-faint"
                          : "border-line-soft bg-bg text-ink"
                      )}
                    >
                      <span className="font-medium">{start}</span>
                      <span className="flex items-center gap-2">
                        <span className={cn("text-[12px]", full ? "text-faint" : "text-muted")}>
                          {booked}/{facility.capacity}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            full
                              ? "bg-line-soft text-faint"
                              : booked === 0
                                ? "bg-gold/15 text-gold"
                                : "bg-gold/10 text-gold"
                          )}
                        >
                          {full ? "Full" : `${remaining} open`}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
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
