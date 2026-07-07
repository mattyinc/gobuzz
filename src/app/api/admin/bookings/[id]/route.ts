import { NextRequest, NextResponse } from "next/server";
import { updateBooking, type BookingStatus } from "@/lib/booking-store";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statuses: BookingStatus[] = [
  "confirmed",
  "checked-in",
  "completed",
  "cancelled",
  "no-show",
];

type Body = {
  date?: string;
  start?: string;
  spots?: number;
  status?: BookingStatus;
  notes?: string | null;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({ error: "Supabase auth is not configured" }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  if (body.status && !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (body.spots !== undefined && (!Number.isInteger(body.spots) || body.spots < 1)) {
    return NextResponse.json({ error: "Invalid spots" }, { status: 400 });
  }

  const { id } = await params;
  const patch: Body = {
    date: body.date,
    start: body.start,
    spots: body.spots,
    status: body.status,
    notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null,
  };

  if (patch.start) {
    if (!/^[0-2][0-9]:[0-5][0-9]$/.test(patch.start)) {
      return NextResponse.json({ error: "Invalid time" }, { status: 400 });
    }
  }

  try {
    const booking = await updateBooking(id, patch);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("admin booking update failed", error);
    return NextResponse.json({ error: "Could not update booking" }, { status: 500 });
  }
}
