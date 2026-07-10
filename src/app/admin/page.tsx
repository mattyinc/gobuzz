import type { Metadata } from "next";
import { CalendarClock, Gauge, ListChecks, Users, type LucideIcon } from "lucide-react";
import { getDashboardStats } from "@/lib/db";
import {
  FACILITIES,
  FACILITY_IDS,
  bookableDates,
  nowInAddis,
  slotsForDate,
  timeToMinutes,
  type FacilityId,
} from "@/lib/facilities";
import { formatStatus } from "@/lib/booking-status";
import type { BookingStatus } from "@/lib/booking-store";

export const metadata: Metadata = {
  title: "Dashboard - Go'Buzz Admin",
  description: "Today's activity across Go'Buzz Wellness facilities.",
};

export const dynamic = "force-dynamic";

const UPCOMING_WINDOW_DAYS = 7;
const STATUSES_SHOWN: BookingStatus[] = [
  "confirmed",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
];

export default function AdminDashboardPage() {
  const dates = bookableDates();
  const today = dates[0];
  const throughDate = dates[Math.min(UPCOMING_WINDOW_DAYS - 1, dates.length - 1)];
  const { minutes: nowMinutes } = nowInAddis();

  const stats = getDashboardStats(today, throughDate);

  const occupancy = FACILITY_IDS.map((id) => {
    const facility = FACILITIES[id];
    const slots = slotsForDate(facility, today);
    const totalCapacity = facility.capacity * slots.length;
    const booked = stats.today.spotsByFacility[id];
    const pct = totalCapacity > 0 ? Math.round((booked / totalCapacity) * 100) : 0;
    return { facility, booked, totalCapacity, pct };
  });

  const nextSessions = groupUpcomingSessions(stats.todaySessions, nowMinutes).slice(0, 6);

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="mt-1 text-[14px] text-muted">
          Snapshot for {formatDate(today)} · next {UPCOMING_WINDOW_DAYS} days at a glance.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarClock}
          label="Today's bookings"
          value={stats.today.total}
          breakdown={FACILITY_IDS.map((id) => ({
            label: FACILITIES[id].name,
            value: stats.today.byFacility[id],
          }))}
        />
        <StatCard
          icon={Users}
          label={`Upcoming (${UPCOMING_WINDOW_DAYS} days)`}
          value={stats.upcoming.total}
          breakdown={FACILITY_IDS.map((id) => ({
            label: FACILITIES[id].name,
            value: stats.upcoming.byFacility[id],
          }))}
        />
        <StatCard
          icon={Gauge}
          label="Today's spots booked"
          value={FACILITY_IDS.reduce((sum, id) => sum + stats.today.spotsByFacility[id], 0)}
          breakdown={occupancy.map(({ facility, booked, totalCapacity }) => ({
            label: facility.name,
            value: `${booked}/${totalCapacity}`,
          }))}
        />
        <StatCard
          icon={ListChecks}
          label="Status breakdown"
          value={STATUSES_SHOWN.reduce((sum, status) => sum + stats.statusBreakdown[status], 0)}
          breakdown={STATUSES_SHOWN.map((status) => ({
            label: formatStatus(status),
            value: stats.statusBreakdown[status],
          }))}
          caption={`across the next ${UPCOMING_WINDOW_DAYS} days`}
        />
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface p-5">
        <h3 className="text-[15px] font-semibold">Today&apos;s occupancy</h3>
        <p className="mt-1 text-[13px] text-muted">Booked spots vs. total capacity per facility.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {occupancy.map(({ facility, booked, totalCapacity, pct }) => (
            <div key={facility.id} className="rounded-xl border border-line-soft bg-bg p-4">
              <p className="text-[13px] font-medium">{facility.name}</p>
              <p className="mt-1 text-[12px] text-muted">
                {booked} / {totalCapacity} spots booked
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full bg-gold transition-[width]"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[12px] font-semibold text-gold">{pct}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line-soft bg-surface p-5">
        <h3 className="text-[15px] font-semibold">Next up today</h3>
        <p className="mt-1 text-[13px] text-muted">Upcoming sessions from now, soonest first.</p>

        {nextSessions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line-soft bg-bg px-4 py-6 text-center text-[13px] text-muted">
            No more sessions booked for today.
          </p>
        ) : (
          <div className="mt-4 grid gap-2.5">
            {nextSessions.map((session) => {
              const facility = FACILITIES[session.facility];
              return (
                <div
                  key={`${session.facility}-${session.start}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-soft bg-bg px-4 py-3"
                >
                  <div>
                    <p className="text-[13px] font-semibold">
                      {session.start} · {facility.name}
                    </p>
                    <p className="mt-1 text-[12px] text-muted">
                      {session.guests.map((g) => g.name).join(", ")}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-line-soft px-3 py-1 text-[12px] font-medium text-muted">
                    {session.spots}/{facility.capacity} spots
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  breakdown,
  caption,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  breakdown: { label: string; value: number | string }[];
  caption?: string;
}) {
  return (
    <div className="rounded-2xl border border-line-soft bg-surface p-5">
      <div className="flex items-center gap-2 text-[12px] font-semibold text-faint">
        <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {caption && <p className="mt-0.5 text-[12px] text-muted">{caption}</p>}
      <dl className="mt-3 grid gap-1 border-t border-line-soft pt-3">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-[12px]">
            <dt className="text-muted">{item.label}</dt>
            <dd className="font-medium text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

type SessionGroup = {
  facility: FacilityId;
  start: string;
  spots: number;
  guests: { name: string; spots: number }[];
};

function groupUpcomingSessions(
  sessions: { facility: FacilityId; start: string; name: string; spots: number }[],
  nowMinutes: number
): SessionGroup[] {
  const groups = new Map<string, SessionGroup>();

  for (const session of sessions) {
    if (timeToMinutes(session.start) < nowMinutes) continue;
    const key = `${session.facility}-${session.start}`;
    const existing = groups.get(key);
    if (existing) {
      existing.spots += session.spots;
      existing.guests.push({ name: session.name, spots: session.spots });
    } else {
      groups.set(key, {
        facility: session.facility,
        start: session.start,
        spots: session.spots,
        guests: [{ name: session.name, spots: session.spots }],
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.start.localeCompare(b.start));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
