# Go'Buzz Wellness — Design System (Master)

Source of truth for the rebuilt gobuzzwellness.com. Page-specific overrides live in `design-system/pages/`.

## Brand

- Logo: extracted from `Go'Buzz Vector File.pdf` → `src/components/logo.tsx` (`LogoFull` wordmark + pulse, `LogoMark` pulse only). Both use `currentColor`.
- Signature motif: the ECG/pulse line (`src/components/pulse-line.tsx`), used as hero accent and section divider.
- Voice: quiet luxury, editorial, short declarative sentences. "Move. Think. Recover."

## Color (CSS vars in `globals.css`, themed via `.dark` on `<html>`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f5f1e6` warm parchment | `#0a0908` near-black | page background |
| `--surface` | `#fbf8f0` | `#121008` | alternating sections, cards |
| `--raised` | `#fffdf7` | `#1a1712` | elevated cards, inputs |
| `--ink` | `#1b1710` | `#f8f1df` brand cream | text |
| `--muted` / `--faint` | `#5d5546` / `#94896f` | `#b3a98f` / `#756c56` | secondary text |
| `--gold` | `#86691c` (contrast-safe) | `#c9a84c` (brand gold) | accent, CTAs, eyebrows |
| `--gold-bright` | `#ab8a33` | `#e0c47a` | hover states |
| `--line` / `--line-soft` | gold @ 28% / 14% | gold @ 25% / 12% | hairlines, borders |

Never use pure white backgrounds or neutral grays — everything is warm-tinted.
Ice bath visuals may use a cool steel-blue gradient accent; everything else stays gold/warm.

## Typography

- Display serif: **P22 Mackinac Pro** (Book 400 / Medium 500 / Bold 700 + italics, licensed OTFs in `src/fonts/`) — `.display` class or `font-serif`. Big headlines, stats, booking codes. Italic + `text-gold` for the emphasized word ("Recover.", "wait.").
- UI sans: **Manrope** (Google Fonts) — body, buttons, labels.
- `.eyebrow` = 11px, 600, letter-spacing 0.28em, uppercase, gold.
- Loaded via `next/font` (local + google) with variables `--font-mackinac` / `--font-manrope` **on `<html>`** (must stay on html — `:root` stacks reference them).

## Recurring patterns

- Pills/rounded-full for buttons and chips; 3xl radius (24px) for cards.
- Hairline separators: `.hairline` (gradient) or `border-line-soft`.
- Scroll reveals: `<Reveal>` component (IntersectionObserver + `.reveal` CSS), 900ms `cubic-bezier(0.22,1,0.36,1)`, staggered `delay` prop.
- Motion is slow and subtle (400–900ms); `prefers-reduced-motion` disables all of it.
- Film grain overlay via `.grain` on body.
- Theme toggle: `ThemeToggle` writes `gobuzz-theme` to localStorage; inline script in `layout.tsx` applies it pre-paint. Default: dark.

## Booking rules (business logic in `src/lib/facilities.ts`)

- Men's Sauna & Women's Sauna: 5 spots/session, 30 min, starts every 30 min.
- Ice Bath: 1 person, 20 min, starts every 30 min (10 min turnover).
- Hours: Mon–Fri 06:00–21:00, Sat–Sun 07:00–20:00 (Africa/Addis_Ababa).
- Booking window: 14 days ahead. Codes look like `GB-XXXXXX`.
