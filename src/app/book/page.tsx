import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { BookingFlow } from "@/components/booking-flow";

export const metadata: Metadata = {
  title: "Book a Session — Go'Buzz Wellness",
  description:
    "Reserve your sauna session or ice bath at Go'Buzz Wellness, Addis Ababa. Live availability, instant confirmation.",
};

export default function BookPage() {
  return (
    <>
      <Nav />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-6 pt-32 pb-24 lg:px-10">
        <BookingFlow />
      </main>
      <Footer />
    </>
  );
}
