import { NextRequest, NextResponse } from "next/server";
import { getBookingByCode } from "@/lib/booking-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const booking = await getBookingByCode(code);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
