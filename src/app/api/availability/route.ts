import { NextRequest, NextResponse } from "next/server";
import {
  FACILITIES,
  FACILITY_IDS,
  isValidDate,
  minutesToTime,
  nowInAddis,
  slotsForDate,
  timeToMinutes,
  type FacilityId,
} from "@/lib/facilities";
import { bookedBySlot } from "@/lib/db";

export type Slot = {
  start: string;
  end: string;
  available: number;
  capacity: number;
  past: boolean;
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const facilityId = params.get("facility") as FacilityId | null;
  const date = params.get("date");

  if (!facilityId || !FACILITY_IDS.includes(facilityId)) {
    return NextResponse.json({ error: "Unknown facility" }, { status: 400 });
  }
  if (!date || !isValidDate(date)) {
    return NextResponse.json({ error: "Date must be within the booking window" }, { status: 400 });
  }

  const facility = FACILITIES[facilityId];
  const taken = bookedBySlot(facilityId, date);
  const now = nowInAddis();

  const slots: Slot[] = slotsForDate(facility, date).map((start) => {
    const startMin = timeToMinutes(start);
    return {
      start,
      end: minutesToTime(startMin + facility.duration),
      available: Math.max(0, facility.capacity - (taken.get(start) ?? 0)),
      capacity: facility.capacity,
      past: date === now.date && startMin <= now.minutes,
    };
  });

  return NextResponse.json({ facility: facilityId, date, slots });
}
