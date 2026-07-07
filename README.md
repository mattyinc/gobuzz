# Go'Buzz Wellness — gobuzzwellness.com rebuild

Premium wellness-club site with a live booking system for the sauna rooms and ice bath.
Next.js 16 (App Router) · Tailwind v4 · better-sqlite3.

## Run

```bash
npm install
npm run dev        # development, http://localhost:3000
# or
npm run build && npm start
```

Bookings are stored in `data/gobuzz.db` (created automatically, git-ignored).
Delete that file to reset all bookings.

## Pages

- `/` — marketing site (hero, method, facilities, membership, contact)
- `/book` — 3-step booking flow with live availability

## API

- `GET /api/availability?facility=sauna-men|sauna-women|ice-bath&date=YYYY-MM-DD`
- `POST /api/bookings` — `{ facility, date, start, spots, name, email, phone? }`
- `GET /api/bookings/:code` — look up a booking (for the future client portal)

## Where things live

- Business rules (capacities, session lengths, hours): `src/lib/facilities.ts`
- Database layer: `src/lib/db.ts`
- Design tokens & theming: `src/app/globals.css` + `design-system/MASTER.md`
- Brand marks (extracted from the original vector PDF): `src/components/logo.tsx`
