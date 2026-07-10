import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Snowflake, Thermometer, Users, type LucideIcon } from "lucide-react";
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
    <div className="grid gap-7">
      <header className="border-b border-line-soft pb-7">
        <p className="text-[12px] font-semibold text-gold">Space planning</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em]">Facilities</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted">
          Read capacity by session, spot open windows, and prepare each room for the day.
        </p>
      </header>

      <section aria-label="Choose service date">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-[12px] font-semibold">Service date</p>
          <p className="text-[11px] text-muted">14-day booking window</p>
        </div>
        <div className="flex gap-1.5 overflow-x-auto border-y border-line-soft py-3">
          {dates.map((date, index) => (
            <Link
              key={date}
              href={`/admin/facilities?date=${date}`}
              aria-current={date === selectedDate ? "date" : undefined}
              className={cn(
                "flex min-w-[76px] shrink-0 flex-col items-center rounded-lg px-3 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                date === selectedDate
                  ? "bg-gold text-bg"
                  : "text-muted hover:bg-raised hover:text-ink"
              )}
            >
              <span className="text-[10px] font-semibold">{index === 0 ? "Today" : formatWeekday(date)}</span>
              <span className="mt-1 text-[13px] font-semibold">{formatDay(date)}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        {FACILITY_IDS.map((id, index) => {
          const facility = FACILITIES[id];
          const slots = slotsForDate(facility, selectedDate);
          const taken = takenByFacility[index];
          const totalBooked = Array.from(taken.values()).reduce((sum, value) => sum + value, 0);
          const fullSlots = slots.filter((start) => (taken.get(start) ?? 0) >= facility.capacity).length;
          const Icon = facility.kind === "ice-bath" ? Snowflake : Flame;

          return (
            <section key={id} className="overflow-hidden rounded-xl border border-line-soft bg-surface">
              <div className="border-b border-line-soft px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/12 text-gold">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-[14px] font-semibold">{facility.name}</h2>
                      <p className="mt-0.5 text-[11px] text-muted">{facility.tagline}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-line-soft px-2.5 py-1 text-[10px] font-semibold text-muted">
                    {fullSlots} full
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 divide-x divide-line-soft border-y border-line-soft py-3">
                  <FacilityFact icon={Thermometer} value={facility.temperature} label="Room" />
                  <FacilityFact icon={Users} value={facility.capacity} label="Capacity" />
                  <FacilityFact icon={Flame} value={`${facility.duration}m`} label="Session" />
                </div>
                <p className="mt-3 text-[11px] text-muted">
                  <strong className="font-semibold text-ink">{totalBooked}</strong> spots booked across {slots.length} sessions
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-5 px-5 py-3">
                {slots.map((start) => {
                  const booked = taken.get(start) ?? 0;
                  const remaining = Math.max(0, facility.capacity - booked);
                  const full = remaining === 0;

                  return (
                    <div key={start} className="flex min-w-0 items-center justify-between gap-2 border-b border-line-soft py-2.5 last:border-b-0">
                      <span className="text-[12px] font-semibold tabular-nums">{start}</span>
                      <span className={cn("text-[10px] font-semibold", full ? "text-faint" : "text-gold")}>
                        {full ? "Full" : `${remaining} open`}
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

function FacilityFact({ icon: Icon, value, label }: { icon: LucideIcon; value: string | number; label: string }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold"><Icon className="h-3 w-3 text-gold" aria-hidden="true" />{value}</p>
      <p className="mt-1 text-[9px] text-faint">{label}</p>
    </div>
  );
}

function formatWeekday(date: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}
