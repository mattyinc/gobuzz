import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Database, LockKeyhole } from "lucide-react";
import { AdminBookingsTable } from "@/components/admin-bookings-table";
import { AdminSignOut } from "@/components/admin-sign-out";
import { bookingBackend, listBookings, type BookingStatus } from "@/lib/booking-store";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bookableDates } from "@/lib/facilities";

export const metadata: Metadata = {
  title: "Bookings - Go'Buzz Admin",
  description: "Manage Go'Buzz Wellness bookings.",
};

export const dynamic = "force-dynamic";

const statusOptions = [
  "all",
  "confirmed",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
] as const;

type StatusFilter = (typeof statusOptions)[number];

function normalizeStatus(value: string | undefined): StatusFilter {
  return statusOptions.includes(value as StatusFilter) ? (value as StatusFilter) : "all";
}

function formatStatus(status: StatusFilter) {
  if (status === "all") return "All";
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  if (!isSupabaseAuthConfigured()) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6 py-16">
        <section className="w-full max-w-lg rounded-2xl border border-line-soft bg-surface p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-bg">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-7 text-2xl font-semibold">Admin needs Supabase Auth</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Add the Supabase environment variables from <code className="text-ink">.env.example</code>{" "}
            and create an admin user in Supabase Auth. The public booking site can still use local
            SQLite while you set this up.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center rounded-full border border-line-soft px-5 text-[14px] font-medium text-muted transition-colors hover:border-gold hover:text-gold"
          >
            Back to site
          </Link>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const dates = bookableDates();
  // no date picked = every upcoming booking in the window, not just today
  const selectedDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : null;
  const selectedStatus = normalizeStatus(params.status);
  const bookings = await listBookings({
    from: selectedDate ?? dates[0],
    to: selectedDate ?? dates[dates.length - 1],
    status: selectedStatus as BookingStatus | "all",
  });

  return (
    <main className="min-h-svh bg-bg px-5 py-6 text-ink lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft pb-5">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-semibold text-gold">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Bookings</h1>
            <p className="mt-1 flex items-center gap-2 text-[14px] text-muted">
              <Database className="h-4 w-4" aria-hidden="true" />
              Storage: {bookingBackend()}
            </p>
          </div>
          <AdminSignOut />
        </header>

        <form className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-line-soft bg-surface p-4">
          <div>
            <label htmlFor="date" className="mb-2 block text-[12px] font-semibold text-muted">
              Date <span className="font-normal text-faint">— empty shows all upcoming</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={selectedDate ?? ""}
              className="h-10 rounded-lg border border-line-soft bg-bg px-3 text-[14px] outline-none focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-2 block text-[12px] font-semibold text-muted">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={selectedStatus}
              className="h-10 rounded-lg border border-line-soft bg-bg px-3 text-[14px] outline-none focus:border-gold"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-10 cursor-pointer rounded-full bg-gold px-5 text-[14px] font-semibold text-bg transition-colors hover:bg-gold-bright"
          >
            Filter
          </button>
        </form>

        <section className="mt-6">
          <AdminBookingsTable bookings={bookings} />
        </section>
      </div>
    </main>
  );
}
