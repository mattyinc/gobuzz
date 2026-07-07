"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  Flame,
  Loader2,
  Minus,
  Plus,
  Snowflake,
  Thermometer,
  Users,
} from "lucide-react";
import {
  FACILITIES,
  FACILITY_IDS,
  bookableDates,
  minutesToTime,
  slotsForDate,
  timeToMinutes,
  type Facility,
  type FacilityId,
} from "@/lib/facilities";
import { PulseLine } from "./pulse-line";

type Slot = {
  start: string;
  end: string;
  available: number;
  capacity: number;
  past: boolean;
};

type Booking = {
  code: string;
  facility: FacilityId;
  date: string;
  start: string;
  spots: number;
  name: string;
  email: string;
};

const stepLabels = ["Experience", "Time", "Details"];
const isStaticPagesBuild = process.env.NEXT_PUBLIC_STATIC_PAGES === "true";

const facilityImages: Record<FacilityId, { src: string; alt: string; flip?: boolean }> = {
  "sauna-men": {
    src: "/facilities/sauna.jpg",
    alt: "Cedar-lined sauna behind a full-height glass wall",
  },
  "sauna-women": {
    src: "/facilities/sauna.jpg",
    alt: "Cedar-lined sauna behind a full-height glass wall",
    flip: true,
  },
  "ice-bath": {
    src: "/facilities/ice-bath.jpg",
    alt: "Wood-clad single-occupancy ice bath with steps",
  },
};

function formatDate(date: string, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`)
  );
}

function FacilityIcon({ facility, className }: { facility: Facility; className?: string }) {
  return facility.kind === "sauna" ? (
    <Flame className={className} strokeWidth={1.5} aria-hidden="true" />
  ) : (
    <Snowflake className={className} strokeWidth={1.5} aria-hidden="true" />
  );
}

export function BookingFlow() {
  const [step, setStep] = useState(0);
  const [facilityId, setFacilityId] = useState<FacilityId | null>(null);
  const [date, setDate] = useState<string>(() => bookableDates()[0]);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [start, setStart] = useState<string | null>(null);
  const [spots, setSpots] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const dates = useMemo(() => bookableDates(), []);
  const facility = facilityId ? FACILITIES[facilityId] : null;
  const selectedSlot = slots?.find((s) => s.start === start) ?? null;

  const loadSlots = useCallback(async (f: FacilityId, d: string) => {
    if (isStaticPagesBuild) {
      const staticSlots = slotsForDate(FACILITIES[f], d).map((slotStart) => {
        const startMinutes = timeToMinutes(slotStart);

        return {
          start: slotStart,
          end: minutesToTime(startMinutes + FACILITIES[f].duration),
          available: FACILITIES[f].capacity,
          capacity: FACILITIES[f].capacity,
          past: false,
        };
      });

      setSlots(staticSlots);
      return;
    }

    setSlotsLoading(true);
    setSlots(null);
    try {
      const res = await fetch(`/api/availability?facility=${f}&date=${d}`);
      const data = await res.json();
      setSlots(res.ok ? data.slots : []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  function chooseFacility(id: FacilityId) {
    setFacilityId(id);
    setStart(null);
    setSpots(1);
    setError(null);
    setStep(1);
    void loadSlots(id, date);
  }

  function chooseDate(d: string) {
    setDate(d);
    setStart(null);
    if (facilityId && step === 1) void loadSlots(facilityId, d);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!facilityId || !start) return;

    if (isStaticPagesBuild) {
      setError("Online booking needs the server build. This GitHub Pages preview is static.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facility: facilityId, date, start, spots, name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        if (res.status === 409) {
          setStep(1);
          void loadSlots(facilityId, date);
        }
        return;
      }
      setBooking(data.booking);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  /* ————————————————— confirmation ————————————————— */
  if (booking && facility) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-bg">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="display mt-8 text-5xl sm:text-6xl">
          You&rsquo;re <em className="text-gold">booked.</em>
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          A confirmation is on its way to {booking.email}. Show your code at the
          front desk — and arrive ten minutes early.
        </p>

        <div className="mt-10 overflow-hidden rounded-3xl border border-line-soft bg-surface text-left">
          <div className="border-b border-line-soft px-8 py-6 text-center">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-faint uppercase">
              Booking code
            </p>
            <p className="mt-2 font-serif text-5xl tracking-[0.08em] text-gold">{booking.code}</p>
          </div>
          <dl className="grid gap-x-6 gap-y-4 px-8 py-7 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">Experience</dt>
              <dd className="mt-1 text-[15px] font-medium">{facility.name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">Date</dt>
              <dd className="mt-1 text-[15px] font-medium">
                {formatDate(booking.date, { weekday: "long", day: "numeric", month: "long" })}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">Time</dt>
              <dd className="mt-1 text-[15px] font-medium">
                {booking.start} · {facility.duration} minutes
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">
                {facility.kind === "sauna" ? "Spots" : "Occupancy"}
              </dt>
              <dd className="mt-1 text-[15px] font-medium">
                {facility.kind === "sauna"
                  ? `${booking.spots} of ${facility.capacity}`
                  : "Private session"}
              </dd>
            </div>
          </dl>
        </div>

        <PulseLine className="mx-auto mt-10 w-40 text-gold/60" />

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              setBooking(null);
              setStep(0);
              setFacilityId(null);
              setStart(null);
              setSpots(1);
            }}
            className="h-12 cursor-pointer rounded-full border border-line px-7 text-[14px] font-medium transition-colors hover:border-gold hover:text-gold"
          >
            Book another session
          </button>
          <Link
            href="/"
            className="flex h-12 items-center rounded-full bg-gold px-7 text-[14px] font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            Back to Go&rsquo;Buzz
          </Link>
        </div>
      </div>
    );
  }

  /* ————————————————— wizard ————————————————— */
  return (
    <div>
      <p className="eyebrow">Reserve your session</p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <h1 className="display text-5xl sm:text-7xl">
          The city can <em className="text-gold">wait.</em>
        </h1>
        <ol className="flex items-center gap-2" aria-label="Booking progress">
          {stepLabels.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                disabled={i > step}
                onClick={() => i < step && setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className={`flex h-9 items-center gap-2 rounded-full border px-4 text-[12px] font-semibold tracking-[0.08em] uppercase transition-colors ${
                  i === step
                    ? "border-gold text-gold"
                    : i < step
                      ? "cursor-pointer border-line-soft text-muted hover:text-gold"
                      : "border-line-soft text-faint"
                }`}
              >
                {i < step && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {label}
              </button>
              {i < stepLabels.length - 1 && <span className="h-px w-4 bg-line" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
      <div className="hairline mt-10" />

      {/* step 1 — experience */}
      {step === 0 && (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FACILITY_IDS.map((id) => {
            const f = FACILITIES[id];
            const img = facilityImages[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => chooseFacility(id)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-line-soft bg-surface text-left transition-all duration-400 hover:border-gold hover:shadow-(--shadow-warm)"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
                      img.flip ? "-scale-x-100" : ""
                    }`}
                  />
                  <div className="absolute inset-0 dark:bg-[#140f08]/40" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
                  <span className="absolute top-4 right-4 rounded-full border border-line bg-bg/60 px-3.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase backdrop-blur">
                    {f.duration} min
                  </span>
                </div>
                <div className="p-7 pt-2">
                <FacilityIcon facility={f} className="h-8 w-8 text-gold" />
                <h2 className="mt-4 font-serif text-3xl font-medium">{f.name}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.tagline}</p>
                <dl className="mt-6 flex items-center gap-5 border-t border-line-soft pt-5 text-[13px] text-muted">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-gold" aria-hidden="true" />
                    <dd>{f.temperature}</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gold" aria-hidden="true" />
                    <dd>{f.capacity === 1 ? "Just you" : `${f.capacity} spots`}</dd>
                  </div>
                </dl>
                <span className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Choose times <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* step 2 — time */}
      {step === 1 && facility && (
        <div className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-medium">
              <FacilityIcon facility={facility} className="h-7 w-7 text-gold" />
              {facility.name}
            </h2>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Change experience
            </button>
          </div>

          {/* date rail */}
          <div className="mt-8 flex gap-2.5 overflow-x-auto pb-2" role="group" aria-label="Choose a date">
            {dates.map((d) => {
              const active = d === date;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => chooseDate(d)}
                  aria-pressed={active}
                  className={`flex w-[4.6rem] shrink-0 cursor-pointer flex-col items-center rounded-2xl border py-3.5 transition-colors duration-300 ${
                    active
                      ? "border-gold bg-gold text-bg"
                      : "border-line-soft bg-surface text-muted hover:border-line hover:text-ink"
                  }`}
                >
                  <span className="text-[11px] font-semibold tracking-[0.12em] uppercase">
                    {formatDate(d, { weekday: "short" })}
                  </span>
                  <span className="mt-1 font-serif text-2xl leading-none">
                    {formatDate(d, { day: "numeric" })}
                  </span>
                  <span className="mt-1 text-[10px] tracking-[0.14em] uppercase opacity-80">
                    {formatDate(d, { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>

          {/* slot grid */}
          <div className="mt-8 min-h-56">
            {slotsLoading && (
              <div className="flex h-56 items-center justify-center text-muted">
                <Loader2 className="h-6 w-6 animate-spin text-gold" aria-hidden="true" />
                <span className="sr-only">Loading availability…</span>
              </div>
            )}
            {!slotsLoading && slots && (
              <>
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-6">
                  {slots.map((s) => {
                    const soldOut = s.available === 0;
                    const disabled = soldOut || s.past;
                    const active = s.start === start;
                    return (
                      <button
                        key={s.start}
                        type="button"
                        disabled={disabled}
                        onClick={() => setStart(active ? null : s.start)}
                        aria-pressed={active}
                        className={`rounded-xl border px-2 py-3 text-center transition-colors duration-200 ${
                          active
                            ? "border-gold bg-gold text-bg"
                            : disabled
                              ? "cursor-not-allowed border-line-soft text-faint opacity-45"
                              : "cursor-pointer border-line-soft bg-surface hover:border-gold"
                        }`}
                      >
                        <span className="block text-[15px] font-semibold tabular-nums">{s.start}</span>
                        <span
                          className={`mt-0.5 block text-[11px] ${
                            active ? "text-bg/80" : soldOut || s.past ? "text-faint" : "text-muted"
                          }`}
                        >
                          {s.past
                            ? "Passed"
                            : soldOut
                              ? "Full"
                              : facility.capacity === 1
                                ? "Open"
                                : `${s.available} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-[13px] text-faint">
                  All times in Addis Ababa (EAT). Sessions are {facility.duration} minutes.
                </p>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!start}
              onClick={() => setStep(2)}
              className={`flex h-13 items-center gap-2.5 rounded-full px-8 text-[14px] font-semibold transition-all duration-300 ${
                start
                  ? "cursor-pointer bg-gold text-bg hover:bg-gold-bright"
                  : "cursor-not-allowed bg-line-soft text-faint"
              }`}
            >
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* step 3 — details */}
      {step === 2 && facility && selectedSlot && (
        <form onSubmit={submit} className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-serif text-3xl font-medium">Your details</h2>
            <div className="mt-8 grid gap-5">
              <div>
                <label htmlFor="bk-name" className="mb-2 block text-[13px] font-semibold tracking-[0.06em] text-muted">
                  Full name
                </label>
                <input
                  id="bk-name"
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Amara Tesfaye"
                  className="h-13 w-full rounded-2xl border border-line-soft bg-surface px-5 text-[15px] placeholder:text-faint focus:border-gold focus:outline-none"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="bk-email" className="mb-2 block text-[13px] font-semibold tracking-[0.06em] text-muted">
                    Email
                  </label>
                  <input
                    id="bk-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-13 w-full rounded-2xl border border-line-soft bg-surface px-5 text-[15px] placeholder:text-faint focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="bk-phone" className="mb-2 block text-[13px] font-semibold tracking-[0.06em] text-muted">
                    Phone <span className="font-normal text-faint">(optional)</span>
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 …"
                    className="h-13 w-full rounded-2xl border border-line-soft bg-surface px-5 text-[15px] placeholder:text-faint focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {facility.capacity > 1 && (
                <div>
                  <span className="mb-2 block text-[13px] font-semibold tracking-[0.06em] text-muted">
                    Spots — bring company
                  </span>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center rounded-full border border-line-soft">
                      <button
                        type="button"
                        onClick={() => setSpots(Math.max(1, spots - 1))}
                        disabled={spots <= 1}
                        aria-label="Fewer spots"
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-serif text-2xl" aria-live="polite">
                        {spots}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSpots(Math.min(selectedSlot.available, spots + 1))}
                        disabled={spots >= selectedSlot.available}
                        aria-label="More spots"
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[13px] text-faint">
                      {selectedSlot.available} spot{selectedSlot.available === 1 ? "" : "s"} open in
                      this session
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="mt-6 rounded-2xl border border-red-400/40 bg-red-500/8 px-5 py-4 text-[14px] text-red-500 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mt-9 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-gold"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to times
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-13 cursor-pointer items-center gap-2.5 rounded-full bg-gold px-8 text-[14px] font-semibold text-bg transition-colors duration-300 hover:bg-gold-bright disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                )}
                Confirm booking
              </button>
            </div>
          </div>

          {/* summary rail */}
          <aside className="h-fit rounded-3xl border border-line-soft bg-surface p-8">
            <p className="eyebrow">Your session</p>
            <div className="mt-6 flex items-center gap-4">
              <FacilityIcon facility={facility} className="h-8 w-8 text-gold" />
              <div>
                <p className="font-serif text-2xl font-medium">{facility.name}</p>
                <p className="text-[13px] text-muted">{facility.temperature} · {facility.duration} minutes</p>
              </div>
            </div>
            <div className="hairline my-6" />
            <dl className="space-y-3 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">Date</dt>
                <dd className="font-medium">
                  {formatDate(date, { weekday: "short", day: "numeric", month: "short" })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Time</dt>
                <dd className="font-medium tabular-nums">
                  {selectedSlot.start} – {selectedSlot.end}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{facility.capacity === 1 ? "Occupancy" : "Spots"}</dt>
                <dd className="font-medium">
                  {facility.capacity === 1 ? "Private" : spots}
                </dd>
              </div>
            </dl>
            <div className="hairline my-6" />
            <p className="text-[13px] leading-relaxed text-faint">
              Arrive 10 minutes before your session. Towels and water are provided.
              Cancellations close 2 hours before start.
            </p>
          </aside>
        </form>
      )}
    </div>
  );
}
