import { NextRequest, NextResponse } from "next/server";
import { getBookingByCode } from "@/lib/booking-store";
import { bookingQrPng, siteOrigin } from "@/lib/qr";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const booking = await getBookingByCode(code);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const png = await bookingQrPng(siteOrigin(request.nextUrl.origin), booking.code);
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="gobuzz-${booking.code}.png"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
