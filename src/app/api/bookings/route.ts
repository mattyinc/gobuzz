import { NextRequest, NextResponse } from "next/server";
import {
  FACILITIES,
  FACILITY_IDS,
  isValidDate,
  nowInAddis,
  slotsForDate,
  timeToMinutes,
  type FacilityId,
} from "@/lib/facilities";
import { createBooking, SlotFullError } from "@/lib/booking-store";
import { sendBookingConfirmation } from "@/lib/email";
import { siteOrigin } from "@/lib/qr";

type Body = {
  facility?: FacilityId;
  date?: string;
  start?: string;
  spots?: number;
  name?: string;
  email?: string;
  phone?: string;
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { facility: facilityId, date, start, name, email, phone } = body;
  const spots = Number(body.spots ?? 1);

  if (!facilityId || !FACILITY_IDS.includes(facilityId)) {
    return NextResponse.json({ error: "Unknown facility" }, { status: 400 });
  }
  const facility = FACILITIES[facilityId];

  if (!date || !isValidDate(date)) {
    return NextResponse.json({ error: "Date must be within the booking window" }, { status: 400 });
  }
  if (!start || !slotsForDate(facility, date).includes(start)) {
    return NextResponse.json({ error: "Invalid session time" }, { status: 400 });
  }
  const now = nowInAddis();
  if (date === now.date && timeToMinutes(start) <= now.minutes) {
    return NextResponse.json({ error: "This session has already started" }, { status: 400 });
  }
  if (!Number.isInteger(spots) || spots < 1 || spots > facility.capacity) {
    return NextResponse.json({ error: "Invalid number of spots" }, { status: 400 });
  }
  if (!name?.trim() || name.trim().length < 2) {
    return NextResponse.json({ error: "Please tell us your name" }, { status: 400 });
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }

  try {
    const booking = await createBooking({
      facility: facilityId,
      date,
      start,
      spots,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
    });
    const { sent: emailSent } = await sendBookingConfirmation(
      booking,
      siteOrigin(request.nextUrl.origin)
    );
    return NextResponse.json({ booking, emailSent }, { status: 201 });
  } catch (err) {
    if (err instanceof SlotFullError) {
      return NextResponse.json(
        { error: err.remaining === 0
            ? "This session just filled up — please pick another time"
            : `Only ${err.remaining} spot${err.remaining === 1 ? "" : "s"} left in this session`,
          remaining: err.remaining },
        { status: 409 }
      );
    }
    console.error("booking failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
