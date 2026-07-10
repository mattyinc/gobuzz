import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Gauge,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { listBookings, type BookingRecord, type BookingStatus } from "@/lib/booking-store";
import {
  FACILITIES,
  FACILITY_IDS,
  bookableDates,
  nowInAddis,
  slotsForDate,
  timeToMinutes,
  type FacilityId,
} from "@/lib/facilities";

export const metadata: Metadata = {
  title: "Dashboard - Go'Buzz Admin",
  description: "Today's activity across Go'Buzz Wellness facilities.",
};

export const dynamic = "force-dynamic";

const UPCOMING_WINDOW_DAYS = 7;
const STATUSES: BookingStatus[] = [
  "confirmed",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
];
const ACTIVE_STATUSES: BookingStatus[] = ["confirmed", "checked-in"];

export default async function AdminDashboardPage() {
  const dates = bookableDates();
  const today = dates[0];
  const throughDate = dates[Math.min(UPCOMING_WINDOW_DAYS - 1, dates.length - 1)];
  const { minutes: nowMinutes } = nowInAddis();
  const bookings = await listBookings({ from: today, to: throughDate, status: "all" });
  const activeBookings = bookings.filter((booking) => ACTIVE_STATUSES.includes(booking.status));
  const todayBookings = activeBookings.filter((booking) => booking.date === today);
  const todaySpots = todayBookings.reduce((sum, booking) => sum + booking.spots, 0);
  const nextSessions = groupUpcomingSessions(todayBookings, nowMinutes).slice(0, 6);
  const statusBreakdown = Object.fromEntries(
    STATUSES.map((status) => [
      status,
      bookings.filter((booking) => booking.status === status).length,
    ])
  ) as Record<BookingStatus, number>;

  const occupancy = FACILITY_IDS.map((id) => {
    const facility = FACILITIES[id];
    const totalCapacity = facility.capacity * slotsForDate(facility, today).length;
    const booked = todayBookings
      .filter((booking) => booking.facility === id)
      .reduce((sum, booking) => sum + booking.spots, 0);
    const pct = totalCapacity > 0 ? Math.round((booked / totalCapacity) * 100) : 0;
    return { facility, booked, totalCapacity, pct };
  });

  const nextStart = nextSessions[0]?.start ?? "Clear";

  return (
    <div className="grid gap-8">
      <header className="flex flex-col gap-5 border-b border-line-soft pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold text-gold">{formatLongDate(today)}</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em]">Good day. Here&apos;s the floor.</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted">
            Live service view for today, with the next seven days in context.
          </p>
        </div>
        <Link
          href={`/admin/bookings?date=${today}`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-gold px-4 text-[13px] font-semibold text-bg transition-colors hover:bg-gold-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:self-auto"
        >
          Today&apos;s bookings
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <section aria-label="Service summary" className="grid border-y border-line-soft sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarDays} label="Bookings today" value={todayBookings.length} detail={`${todaySpots} guest spots`} />
        <Metric icon={Clock3} label="Next session" value={nextStart} detail={nextSessions[0] ? FACILITIES[nextSessions[0].facility].name : "Nothing else scheduled"} />
        <Metric icon={Users} label="Next 7 days" value={activeBookings.length} detail={`${activeBookings.reduce((sum, booking) => sum + booking.spots, 0)} guest spots`} />
        <Metric icon={Gauge} label="Checked in" value={statusBreakdown["checked-in"]} detail={`${statusBreakdown.completed} completed`} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold">Next up today</h2>
              <p className="mt-1 text-[13px] text-muted">Upcoming sessions, nearest first.</p>
            </div>
            <span className="text-[12px] font-medium text-faint">Addis Ababa time</span>
          </div>

          {nextSessions.length === 0 ? (
            <div className="mt-5 border-y border-line-soft py-10 text-center">
              <Clock3 className="mx-auto h-5 w-5 text-gold" aria-hidden="true" />
              <p className="mt-3 text-[14px] font-semibold">The rest of today is clear</p>
              <p className="mt-1 text-[13px] text-muted">New bookings will appear here automatically.</p>
            </div>
          ) : (
            <div className="mt-5 border-t border-line-soft">
              {nextSessions.map((session, index) => {
                const facility = FACILITIES[session.facility];
                return (
                  <div
                    key={`${session.facility}-${session.start}`}
                    className="grid gap-3 border-b border-line-soft py-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div>
                      <p className="text-[16px] font-semibold tabular-nums">{session.start}</p>
                      {index === 0 && <p className="mt-0.5 text-[10px] font-semibold text-gold">NEXT</p>}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14px] font-semibold">{facility.name}</p>
                        <span className="text-[11px] text-faint">{facility.duration} min</span>
                      </div>
                      <p className="mt-1 truncate text-[12px] text-muted">
                        {session.guests.map((guest) => guest.name).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-muted">
                        <strong className="font-semibold text-ink">{session.spots}</strong> / {facility.capacity} spots
                      </span>
                      <Link
                        href={`/admin/bookings?date=${today}`}
                        aria-label={`Open bookings for ${session.start}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line-soft text-muted transition-colors hover:border-gold hover:text-gold"
                      >
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="border-t border-line-soft pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <h2 className="text-[18px] font-semibold">Capacity today</h2>
          <p className="mt-1 text-[13px] text-muted">Booked spots across the full service day.</p>
          <div className="mt-6 grid gap-6">
            {occupancy.map(({ facility, booked, totalCapacity, pct }) => (
              <div key={facility.id}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-semibold">{facility.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{facility.temperature} / {facility.duration} min</p>
                  </div>
                  <p className="text-[12px] tabular-nums text-muted">
                    <strong className="font-semibold text-ink">{booked}</strong> / {totalCapacity}
                  </p>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-raised">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <p className="mt-1.5 text-right text-[10px] font-semibold text-gold">{pct}%</p>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-line-soft pt-6">
            <h3 className="text-[13px] font-semibold">Booking health</h3>
            <div className="mt-3 grid gap-2.5">
              {STATUSES.map((status) => (
                <div key={status} className="flex items-center justify-between gap-3">
                  <BookingStatusBadge status={status} />
                  <span className="text-[13px] font-semibold tabular-nums">{statusBreakdown[status]}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="border-b border-line-soft py-5 xl:border-b-0 xl:border-r xl:px-6 xl:first:pl-0 xl:last:border-r-0">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-muted">
        <Icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-[26px] font-semibold tracking-[-0.02em] tabular-nums">{value}</p>
      <p className="mt-1 truncate text-[11px] text-faint">{detail}</p>
    </div>
  );
}

type SessionGroup = {
  facility: FacilityId;
  start: string;
  spots: number;
  guests: { name: string; spots: number }[];
};

function groupUpcomingSessions(bookings: BookingRecord[], nowMinutes: number): SessionGroup[] {
  const groups = new Map<string, SessionGroup>();

  for (const booking of bookings) {
    if (timeToMinutes(booking.start) < nowMinutes) continue;
    const key = `${booking.facility}-${booking.start}`;
    const existing = groups.get(key);
    if (existing) {
      existing.spots += booking.spots;
      existing.guests.push({ name: booking.name, spots: booking.spots });
    } else {
      groups.set(key, {
        facility: booking.facility,
        start: booking.start,
        spots: booking.spots,
        guests: [{ name: booking.name, spots: booking.spots }],
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.start.localeCompare(b.start));
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
