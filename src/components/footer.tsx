import Link from "next/link";
import { LogoMark } from "./logo";

const socials = [
  { label: "TikTok", href: "https://tiktok.com/@gobuzzwellness" },
  { label: "YouTube", href: "https://youtube.com/@gobuzzwellness" },
  { label: "Instagram", href: "https://instagram.com/gobuzzwellness" },
];

export function Footer() {
  return (
    <footer className="border-t border-line-soft bg-surface" id="visit">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <LogoMark className="h-10 w-auto text-gold" />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted">
              A private wellness club in Addis Ababa. Heat, cold, and stillness —
              the tools of recovery, done properly.
            </p>
          </div>

          <div>
            <h3 className="eyebrow">Visit</h3>
            <address className="mt-4 space-y-1.5 text-[15px] not-italic leading-relaxed text-muted">
              <p>Bole, Addis Ababa</p>
              <p>Ethiopia</p>
              <p className="pt-2">
                <a
                  href="mailto:hello@gobuzzwellness.com"
                  className="transition-colors hover:text-gold"
                >
                  hello@gobuzzwellness.com
                </a>
              </p>
            </address>
          </div>

          <div>
            <h3 className="eyebrow">Hours</h3>
            <dl className="mt-4 space-y-1.5 text-[15px] leading-relaxed text-muted">
              <div className="flex justify-between gap-4">
                <dt>Mon – Fri</dt>
                <dd>6:00 – 21:00</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Sat – Sun</dt>
                <dd>7:00 – 20:00</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="eyebrow">Follow</h3>
            <ul className="mt-4 space-y-1.5 text-[15px] text-muted">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-gold"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hairline mt-14" />
        <div className="mt-7 flex flex-col items-center justify-between gap-4 text-[13px] text-faint sm:flex-row">
          <p>© 2026 Go&rsquo;Buzz Wellness. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/book" className="transition-colors hover:text-gold">
              Book a session
            </Link>
            <span className="tracking-[0.2em] uppercase">Move · Think · Recover</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
