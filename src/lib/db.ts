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
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings (facility, date, start);
  `);
  return db;
}

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
  created_at: string;
};

/** spots already taken per start time for one facility/date */
export function bookedBySlot(facility: FacilityId, date: string): Map<string, number> {
  const rows = getDb()
    .prepare(
      `SELECT start, SUM(spots) AS taken FROM bookings
       WHERE facility = ? AND date = ? GROUP BY start`
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
         WHERE facility = ? AND date = ? AND start = ?`
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
