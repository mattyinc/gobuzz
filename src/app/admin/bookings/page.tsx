import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Database, LockKeyhole } from "lucide-react";
import {
  AdminBookingsFilters,
  normalizeStatus,
} from "@/components/admin-bookings-filters";
import { AdminBookingsTable } from "@/components/admin-bookings-table";
import { AdminSignOut } from "@/components/admin-sign-out";
import { ThemeToggle } from "@/components/theme-toggle";
import { bookingBackend, listBookings, type BookingStatus } from "@/lib/booking-store";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bookableDates } from "@/lib/facilities";

export const metadata: Metadata = {
  title: "Bookings - Go'Buzz Admin",
  description: "Manage Go'Buzz Wellness bookings.",
};

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  if (!isSupabaseAuthConfigured()) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6 py-16">
        <section className="w-full max-w-lg rounded-2xl border border-line-soft bg-surface p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-bg">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <ThemeToggle />
          </div>
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AdminSignOut />
          </div>
        </header>

        <AdminBookingsFilters selectedDate={selectedDate} selectedStatus={selectedStatus} />

        <section className="mt-6">
          <AdminBookingsTable bookings={bookings} />
        </section>
      </div>
    </main>
  );
}
