/**
 * Booking domain model. Pure functions only — imported by both the
 * booking UI and the API routes.
 *
 * House rules:
 *  - Two saunas (men's and women's), 5 spots each, 30-minute sessions.
 *  - One ice bath, single occupancy, 20-minute sessions (10 min turnover),
 *    so sessions start on the half hour like the saunas.
 */

export type FacilityId = "sauna-men" | "sauna-women" | "ice-bath";

export type Facility = {
  id: FacilityId;
  name: string;
  kind: "sauna" | "ice-bath";
  tagline: string;
  capacity: number;
  /** minutes a session lasts */
  duration: number;
  /** minutes between consecutive session starts */
  interval: number;
  temperature: string;
};

export const FACILITIES: Record<FacilityId, Facility> = {
  "sauna-men": {
    id: "sauna-men",
    name: "Men's Sauna",
    kind: "sauna",
    tagline: "Cedar-lined heat room · men only",
    capacity: 5,
    duration: 30,
    interval: 30,
    temperature: "85°C",
  },
  "sauna-women": {
    id: "sauna-women",
    name: "Women's Sauna",
    kind: "sauna",
    tagline: "Cedar-lined heat room · women only",
    capacity: 5,
    duration: 30,
    interval: 30,
    temperature: "85°C",
  },
  "ice-bath": {
    id: "ice-bath",
    name: "Ice Bath",
    kind: "ice-bath",
    tagline: "Single-occupancy cold plunge",
    capacity: 1,
    duration: 20,
    interval: 30,
    temperature: "3°C",
  },
};

export const FACILITY_IDS = Object.keys(FACILITIES) as FacilityId[];

/** Opening hours, minutes from midnight. Sun = 0. */
export function openingHours(dayOfWeek: number): { open: number; close: number } {
  const weekend = dayOfWeek === 0 || dayOfWeek === 6;
  return weekend ? { open: 7 * 60, close: 20 * 60 } : { open: 6 * 60, close: 21 * 60 };
}

export const TIMEZONE = "Africa/Addis_Ababa";
export const BOOKING_WINDOW_DAYS = 14;

export function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** All session start times (HH:MM) for a facility on a given date. */
export function slotsForDate(facility: Facility, date: string): string[] {
  const dow = new Date(`${date}T12:00:00`).getDay();
  const { open, close } = openingHours(dow);
  const starts: string[] = [];
  for (let t = open; t + facility.duration <= close; t += facility.interval) {
    starts.push(minutesToTime(t));
  }
  return starts;
}

/** Current date (YYYY-MM-DD) and minutes-since-midnight in Addis Ababa. */
export function nowInAddis(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) % 24 * 60 + Number(get("minute")),
  };
}

/** The next BOOKING_WINDOW_DAYS dates (YYYY-MM-DD), starting today in Addis. */
export function bookableDates(): string[] {
  const { date } = nowInAddis();
  const start = new Date(`${date}T12:00:00Z`);
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && bookableDates().includes(date);
}
