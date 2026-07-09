import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

import {
  FACILITIES,
  type FacilityId,
} from "./facilities";

const DATA_DIR = path.join(process.cwd(), "data");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, "gobuzz.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      facility TEXT NOT NULL,
      date TEXT NOT NULL,
      start TEXT NOT NULL,
      spots INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings (facility, date, start);
  `);
  migrateDb(db);
  return db;
}

function migrateDb(database: Database.Database) {
  const columns = database.prepare(`PRAGMA table_info(bookings)`).all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));

  if (!names.has("status")) {
    database.exec(`ALTER TABLE bookings ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed'`);
  }

  if (!names.has("notes")) {
    database.exec(`ALTER TABLE bookings ADD COLUMN notes TEXT`);
  }
}

export type BookingStatus = "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show";

export type BookingRow = {
  id: number;
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
};

/** spots already taken per start time for one facility/date */
export function bookedBySlot(facility: FacilityId, date: string): Map<string, number> {
  const rows = getDb()
    .prepare(
      `SELECT start, SUM(spots) AS taken FROM bookings
       WHERE facility = ? AND date = ? AND status IN ('confirmed', 'checked-in') GROUP BY start`
    )
    .all(facility, date) as { start: string; taken: number }[];
  return new Map(rows.map((r) => [r.start, r.taken]));
}

function generateCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "GB-";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export class SlotFullError extends Error {
  constructor(public remaining: number) {
    super("Not enough spots left in this session");
  }
}

export function createBooking(input: {
  facility: FacilityId;
  date: string;
  start: string;
  spots: number;
  name: string;
  email: string;
  phone?: string;
}): BookingRow {
  const d = getDb();
  const capacity = FACILITIES[input.facility].capacity;

  const insert = d.transaction(() => {
    const row = d
      .prepare(
        `SELECT COALESCE(SUM(spots), 0) AS taken FROM bookings
         WHERE facility = ? AND date = ? AND start = ? AND status IN ('confirmed', 'checked-in')`
      )
      .get(input.facility, input.date, input.start) as { taken: number };

    const remaining = capacity - row.taken;
    if (input.spots > remaining) throw new SlotFullError(Math.max(0, remaining));

    let code = generateCode();
    while (d.prepare(`SELECT 1 FROM bookings WHERE code = ?`).get(code)) {
      code = generateCode();
    }

    const result = d
      .prepare(
        `INSERT INTO bookings (code, facility, date, start, spots, name, email, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        code,
        input.facility,
        input.date,
        input.start,
        input.spots,
        input.name,
        input.email,
        input.phone ?? null
      );
    return d
      .prepare(`SELECT * FROM bookings WHERE id = ?`)
      .get(result.lastInsertRowid) as BookingRow;
  });

  return insert();
}

export function getBookingByCode(code: string): BookingRow | undefined {
  return getDb()
    .prepare(`SELECT * FROM bookings WHERE code = ?`)
    .get(code.toUpperCase()) as BookingRow | undefined;
}

export function listBookings(options: {
  from?: string;
  to?: string;
  status?: BookingStatus | "all";
} = {}): BookingRow[] {
  const filters: string[] = [];
  const params: unknown[] = [];

  if (options.from) {
    filters.push("date >= ?");
    params.push(options.from);
  }

  if (options.to) {
    filters.push("date <= ?");
    params.push(options.to);
  }

  if (options.status && options.status !== "all") {
    filters.push("status = ?");
    params.push(options.status);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  return getDb()
    .prepare(
      `SELECT * FROM bookings ${where}
       ORDER BY date ASC, start ASC, created_at DESC
       LIMIT 250`
    )
    .all(...params) as BookingRow[];
}

export function updateBooking(
  id: string,
  input: Partial<{
    date: string;
    start: string;
    spots: number;
    status: BookingStatus;
    notes: string | null;
  }>
): BookingRow | undefined {
  const allowed = ["date", "start", "spots", "status", "notes"] as const;
  const entries = allowed
    .filter((key) => input[key] !== undefined)
    .map((key) => [key, input[key]] as const);

  if (!entries.length) {
    return getDb().prepare(`SELECT * FROM bookings WHERE id = ?`).get(id) as BookingRow | undefined;
  }

  const assignments = entries.map(([key]) => `${key} = ?`).join(", ");
  const values = entries.map(([, value]) => value);

  getDb()
    .prepare(`UPDATE bookings SET ${assignments} WHERE id = ?`)
    .run(...values, id);

  return getDb().prepare(`SELECT * FROM bookings WHERE id = ?`).get(id) as BookingRow | undefined;
}

export function deleteBooking(id: string): boolean {
  const result = getDb().prepare(`DELETE FROM bookings WHERE id = ?`).run(id);
  return result.changes > 0;
}
