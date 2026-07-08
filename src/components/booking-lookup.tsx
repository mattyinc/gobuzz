"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import {
  FACILITIES,
  nowInAddis,
  timeToMinutes,
  type FacilityId,
} from "@/lib/facilities";
import { type BookingStatus } from "@/lib/db";
import { PulseLine } from "./pulse-line";

const isStaticPagesBuild = process.env.NEXT_PUBLIC_STATIC_PAGES === "true";

type BookingResult = {
  code: string;
  facility: FacilityId;
  date: string;
  start: string;
  spots: number;
  name: string;
  status: BookingStatus;
};

type Phase =
  | { kind: "upcoming"; label: string }
  | { kind: "live"; remainingMin: number; progress: number }
  | { kind: "done" }
  | { kind: "cancelled" };

function formatDate(date: string, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`)
  );
}

/** Where this session stands right now, Addis Ababa time. */
function sessionPhase(booking: BookingResult): Phase {
  if (booking.status === "cancelled" || booking.status === "no-show") {
    return { kind: "cancelled" };
  }
  const facility = FACILITIES[booking.facility];
  const now = nowInAddis();
  const startMin = timeToMinutes(booking.start);
  const endMin = startMin + facility.duration;

  if (booking.date > now.date) {
    const days = Math.round(
      (Date.parse(`${booking.date}T00:00:00Z`) - Date.parse(`${now.date}T00:00:00Z`)) / 86_400_000
    );
    return {
      kind: "upcoming",
      label: days === 1 ? "Starts tomorrow" : `Starts in ${days} days`,
    };
  }
  if (booking.date < now.date || now.minutes >= endMin || booking.status === "completed") {
    return { kind: "done" };
  }
  if (now.minutes < startMin) {
    const wait = startMin - now.minutes;
    const h = Math.floor(wait / 60);
    const m = wait % 60;
    return {
      kind: "upcoming",
      label: `Starts in ${h > 0 ? `${h}h ` : ""}${m}m`,
    };
  }
  return {
    kind: "live",
    remainingMin: endMin - now.minutes,
    progress: (now.minutes - startMin) / facility.duration,
  };
}

export function BookingLookup() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [, forceTick] = useState(0);

  // live countdown — re-evaluate the phase every 30s while a booking is shown
  useEffect(() => {
    if (!booking) return;
    const t = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, [booking]);

  const lookup = useCallback(async (raw: string) => {
    const normalized = raw.trim().toUpperCase();
    if (!normalized) return;
    if (isStaticPagesBuild) {
      setError("Booking lookup needs the live site. This GitHub Pages preview is static.");
      return;
    }
    setLoading(true);
    setError(null);
    setBooking(null);
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(normalized)}`);
      if (!res.ok) {
        setError(
          res.status === 404
            ? "We couldn't find that code. Check your confirmation — it looks like GB-XXXXXX."
            : "Something went wrong — please try again."
        );
        return;
      }
      const data = await res.json();
      setBooking(data.booking);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // support /my-booking?code=GB-XXXXXX deep links (e.g. from the confirmation screen)
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("code");
    if (fromUrl) {
      setCode(fromUrl.toUpperCase());
      void lookup(fromUrl);
    }
  }, [lookup]);

  const facility = booking ? FACILITIES[booking.facility] : null;
  const phase = booking ? sessionPhase(booking) : null;

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(code);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="lookup-code" className="sr-only">
          Booking code
        </label>
        <input
          id="lookup-code"
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="GB-XXXXXX"
          autoComplete="off"
          spellCheck={false}
          className="h-13 flex-1 rounded-full border border-line bg-raised px-6 font-serif text-xl tracking-[0.08em] text-ink placeholder:text-faint focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-8 text-[14px] font-semibold tracking-[0.04em] text-bg transition-colors duration-300 hover:bg-gold-bright disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
          Find my session
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-line bg-surface px-5 py-4 text-[14px] text-muted">
          {error}
        </p>
      )}

      {booking && facility && phase && (
        <div className="mt-10 overflow-hidden rounded-3xl border border-line-soft bg-surface">
          {/* status band */}
          {phase.kind === "live" && (
            <div className="border-b border-line-soft px-8 py-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.16em] text-gold uppercase">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
                  </span>
                  In session
                </p>
                <p className="font-serif text-3xl text-ink">
                  {phase.remainingMin} <span className="text-lg text-muted">min left</span>
                </p>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(phase.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Session progress"
                className="mt-4 h-1.5 overflow-hidden rounded-full bg-line-soft"
              >
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-1000"
                  style={{ width: `${Math.min(100, Math.round(phase.progress * 100))}%` }}
                />
              </div>
            </div>
          )}
          {phase.kind === "upcoming" && (
            <div className="flex items-center justify-between border-b border-line-soft px-8 py-6">
              <p className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.16em] text-gold uppercase">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Confirmed
              </p>
              <p className="font-serif text-2xl text-ink">{phase.label}</p>
            </div>
          )}
          {phase.kind === "done" && (
            <div className="flex items-center justify-between border-b border-line-soft px-8 py-6">
              <p className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.16em] text-gold uppercase">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Session complete
              </p>
              <p className="font-serif text-2xl text-ink">Come back stronger.</p>
            </div>
          )}
          {phase.kind === "cancelled" && (
            <div className="flex items-center justify-between border-b border-line-soft px-8 py-6">
              <p className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.16em] text-faint uppercase">
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Cancelled
              </p>
              <p className="text-[14px] text-muted">This booking is no longer active.</p>
            </div>
          )}

          <div className="px-8 pt-6 pb-2 text-center">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-faint uppercase">
              Booking code
            </p>
            <p className="mt-1.5 font-serif text-4xl tracking-[0.08em] text-gold">{booking.code}</p>
            {phase.kind !== "cancelled" && phase.kind !== "done" && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- dynamic API-generated image */}
                <img
                  src={`/api/bookings/${booking.code}/qr`}
                  alt={`QR code for booking ${booking.code}`}
                  width={160}
                  height={160}
                  className="mx-auto mt-4 h-40 w-40 rounded-2xl border border-line-soft"
                />
                <p className="mt-2.5 text-[13px] text-faint">
                  Scan at the front desk — or save it to your phone.
                </p>
              </>
            )}
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
                {facility.kind === "sauna" ? `${booking.spots} of ${facility.capacity}` : "Private session"}
              </dd>
            </div>
          </dl>

          {phase.kind !== "cancelled" && phase.kind !== "done" && (
            <p className="border-t border-line-soft px-8 py-5 text-[13px] leading-relaxed text-faint">
              Arrive 10 minutes early with this code. Need to change your time?
              Call the front desk — cancellations close 2 hours before start.
            </p>
          )}
          {(phase.kind === "cancelled" || phase.kind === "done") && (
            <div className="border-t border-line-soft px-8 py-5">
              <Link
                href="/book"
                className="group inline-flex items-center gap-2 text-[14px] font-semibold text-gold transition-colors hover:text-gold-bright"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                Book your next session
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      )}

      {booking && <PulseLine className="mx-auto mt-10 w-36 text-gold/60" />}
    </div>
  );
}
