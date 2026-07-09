import {
  bookedBySlot as bookedBySlotSqlite,
  createBooking as createBookingSqlite,
  getBookingByCode as getBookingByCodeSqlite,
  listBookings as listBookingsSqlite,
  updateBooking as updateBookingSqlite,
  deleteBooking as deleteBookingSqlite,
  SlotFullError,
  type BookingRow as SqliteBookingRow,
  type BookingStatus,
} from "./db";
import { createSupabaseServiceClient } from "./supabase/server";
import { isSupabaseDataConfigured } from "./supabase/env";
import { type FacilityId } from "./facilities";

export { SlotFullError, type BookingStatus };

export type BookingRecord = {
  id: string;
  code: string;
  facility: FacilityId;
  date: string;
  start: string;
  spots: number;
  name: string;
  email: string;
  phone: string | null;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at?: string | null;
};

type BookingInput = {
  facility: FacilityId;
  date: string;
  start: string;
  spots: number;
  name: string;
  email: string;
  phone?: string;
};

function fromSqlite(row: SqliteBookingRow): BookingRecord {
  return {
    ...row,
    id: String(row.id),
    updated_at: null,
  };
}

function parseSlotFullMessage(message: string): SlotFullError | null {
  const match = message.match(/slot_full:(\d+)/);
  if (!match) return null;
  return new SlotFullError(Number(match[1]));
}

export function bookingBackend() {
  return isSupabaseDataConfigured() ? "supabase" : "sqlite";
}

export async function bookedBySlot(facility: FacilityId, date: string): Promise<Map<string, number>> {
  if (!isSupabaseDataConfigured()) {
    return bookedBySlotSqlite(facility, date);
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("start, spots")
    .eq("facility", facility)
    .eq("date", date)
    .in("status", ["confirmed", "checked-in"]);

  if (error) throw error;

  const taken = new Map<string, number>();
  for (const row of data ?? []) {
    taken.set(row.start, (taken.get(row.start) ?? 0) + Number(row.spots));
  }
  return taken;
}

export async function createBooking(input: BookingInput): Promise<BookingRecord> {
  if (!isSupabaseDataConfigured()) {
    return fromSqlite(createBookingSqlite(input));
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("create_booking", {
    p_facility: input.facility,
    p_date: input.date,
    p_start: input.start,
    p_spots: input.spots,
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone ?? null,
  });

  if (error) {
    const slotFull = parseSlotFullMessage(error.message);
    if (slotFull) throw slotFull;
    throw error;
  }

  return data as BookingRecord;
}

export async function getBookingByCode(code: string): Promise<BookingRecord | undefined> {
  if (!isSupabaseDataConfigured()) {
    const booking = getBookingByCodeSqlite(code);
    return booking ? fromSqlite(booking) : undefined;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return (data ?? undefined) as BookingRecord | undefined;
}

export async function listBookings(options: {
  from?: string;
  to?: string;
  status?: BookingStatus | "all";
} = {}): Promise<BookingRecord[]> {
  if (!isSupabaseDataConfigured()) {
    return listBookingsSqlite(options).map(fromSqlite);
  }

  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from("bookings")
    .select("*")
    .order("date", { ascending: true })
    .order("start", { ascending: true })
    .limit(250);

  if (options.from) query = query.gte("date", options.from);
  if (options.to) query = query.lte("date", options.to);
  if (options.status && options.status !== "all") query = query.eq("status", options.status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BookingRecord[];
}

export async function updateBooking(
  id: string,
  input: Partial<{
    date: string;
    start: string;
    spots: number;
    status: BookingStatus;
    notes: string | null;
  }>
): Promise<BookingRecord | undefined> {
  if (!isSupabaseDataConfigured()) {
    const booking = updateBookingSqlite(id, input);
    return booking ? fromSqlite(booking) : undefined;
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .update(input)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return (data ?? undefined) as BookingRecord | undefined;
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (!isSupabaseDataConfigured()) {
    return deleteBookingSqlite(id);
  }

  const supabase = createSupabaseServiceClient();
  const { error, count } = await supabase
    .from("bookings")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}
