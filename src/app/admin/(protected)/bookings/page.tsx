import type { Metadata } from "next";
import { AdminBookingsFilters } from "@/components/admin-bookings-filters";
import { normalizeStatus } from "@/lib/booking-status";
import { AdminBookingsTable } from "@/components/admin-bookings-table";
import { listBookings, type BookingStatus } from "@/lib/booking-store";
import { bookableDates } from "@/lib/facilities";

export const metadata: Metadata = {
  title: "Bookings - Go'Buzz Admin",
  description: "Manage Go'Buzz Wellness bookings.",
};

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const dates = bookableDates();
  // no date picked = every upcoming booking in the window, not just today
  const selectedDate =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : null;
  const selectedStatus = normalizeStatus(params.status);
  const query = params.q?.trim().slice(0, 100) ?? "";
  const allBookings = await listBookings({
    from: selectedDate ?? dates[0],
    to: selectedDate ?? dates[dates.length - 1],
    status: selectedStatus as BookingStatus | "all",
  });
  const normalizedQuery = query.toLocaleLowerCase();
  const bookings = normalizedQuery
    ? allBookings.filter((booking) =>
        [booking.name, booking.email, booking.phone, booking.code]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery))
      )
    : allBookings;

  return (
    <div className="grid gap-7">
      <header className="border-b border-line-soft pb-7">
        <p className="text-[12px] font-semibold text-gold">Guest operations</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em]">Bookings</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted">
          Find a guest, review their session, and open a booking only when a change is needed.
        </p>
      </header>

      <AdminBookingsFilters selectedDate={selectedDate} selectedStatus={selectedStatus} selectedQuery={query} />

      <section>
        <AdminBookingsTable
          key={`${selectedDate ?? "all"}:${selectedStatus}:${query}`}
          bookings={bookings}
        />
      </section>
    </div>
  );
}
