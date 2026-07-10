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
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
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
    <>
      <div>
        <h2 className="text-2xl font-semibold">Bookings</h2>
        <p className="mt-1 text-[14px] text-muted">
          Search, edit, and manage guest bookings across every facility.
        </p>
      </div>

      <AdminBookingsFilters selectedDate={selectedDate} selectedStatus={selectedStatus} />

      <section className="mt-6">
        <AdminBookingsTable bookings={bookings} />
      </section>
    </>
  );
}
