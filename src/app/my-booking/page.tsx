import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BookingLookup } from "@/components/booking-lookup";

export const metadata: Metadata = {
  title: "My Booking — Go'Buzz Wellness",
  description:
    "Look up your Go'Buzz session with your booking code — see your time, spots, and how long you have left.",
};

export default function MyBookingPage() {
  return (
    <>
      <Nav />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-6 pt-32 pb-24 lg:px-10">
        <div className="text-center">
          <p className="eyebrow">Client Portal</p>
          <h1 className="display mt-5 text-5xl sm:text-7xl">
            Your <em className="text-gold">session.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-muted">
            Enter the code from your confirmation to see your booking — and how
            long you have in the heat or the cold.
          </p>
        </div>
        <div className="mt-12">
          <Suspense fallback={null}>
            <BookingLookup />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
