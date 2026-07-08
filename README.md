# Go'Buzz Wellness — gobuzzwellness.com rebuild

Premium wellness-club site with a live booking system for the sauna rooms and ice bath.
Next.js 16 (App Router) · Tailwind v4 · Supabase · better-sqlite3 fallback.

## Run

```bash
npm install
npm run dev        # development, http://localhost:3000
# or
npm run build && npm start
```

Bookings are stored in `data/gobuzz.db` (created automatically, git-ignored).
Delete that file to reset all bookings.

For production, configure Supabase:

1. Create a Supabase project.
2. Run `supabase/migrations/20260707210000_create_bookings.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Create the admin user in Supabase Auth.

When `SUPABASE_SERVICE_ROLE_KEY` is present, booking data uses Supabase. Without it, local development falls back to SQLite.

### Confirmation emails

Set `RESEND_API_KEY` (from [resend.com](https://resend.com)) to email each guest a
branded confirmation with their booking code, a scannable QR (also attached as a
PNG they can save to a wallet app), and an `.ics` calendar invite. Verify your
sending domain in Resend and set `BOOKING_FROM_EMAIL`. Without the key, bookings
still work — the email step is skipped.

## Pages

- `/` — marketing site (hero, method, facilities, membership, contact)
- `/book` — 3-step booking flow with live availability
- `/my-booking` — client portal: look up a booking by code, live time-remaining
- `/admin/login` — private admin login
- `/admin/bookings` — private booking management

## API

- `GET /api/availability?facility=sauna-men|sauna-women|ice-bath&date=YYYY-MM-DD`
- `POST /api/bookings` — `{ facility, date, start, spots, name, email, phone? }`
- `GET /api/bookings/:code` — look up a booking (powers the client portal)
- `GET /api/bookings/:code/qr` — QR code PNG linking to the client portal
- `PATCH /api/admin/bookings/:id` — update admin-managed booking fields

## Where things live

- Business rules (capacities, session lengths, hours): `src/lib/facilities.ts`
- Database layer: `src/lib/db.ts`
- Design tokens & theming: `src/app/globals.css` + `design-system/MASTER.md`
- Brand marks (extracted from the original vector PDF): `src/components/logo.tsx`
