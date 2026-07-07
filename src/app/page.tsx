import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Clock,
  Flame,
  Snowflake,
  Thermometer,
  Users,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal";
import { PulseLine } from "@/components/pulse-line";
import { LogoMark } from "@/components/logo";
import { FoundingForm } from "@/components/founding-form";
import { publicAsset } from "@/lib/paths";

const marqueeItems = [
  "Sauna Sessions",
  "Ice Baths",
  "Breathwork",
  "Recovery Massage",
  "Functional Movement",
  "Contrast Therapy",
];

const method = [
  {
    n: "01",
    title: "Move",
    copy:
      "Functional fitness coached with intention. Strength, conditioning and movement built around your body and your life — never a generic programme.",
    tags: ["Strength", "Conditioning", "Mobility"],
  },
  {
    n: "02",
    title: "Think",
    copy:
      "Behavioural science meets personal development. One-on-one consultancy bridging psychology, habit formation and lifestyle design.",
    tags: ["Psychology", "Habits", "Clarity"],
  },
  {
    n: "03",
    title: "Recover",
    copy:
      "Sauna. Ice bath. Massage. The tools elite performers use to repair, reset, and come back stronger — now in the heart of Addis Ababa.",
    tags: ["Heat", "Cold", "Stillness"],
  },
];

const steps = [
  {
    n: "1",
    title: "Choose your experience",
    copy: "Men's or women's sauna — five spots a session — or the single-occupancy ice bath.",
  },
  {
    n: "2",
    title: "Pick your time",
    copy: "Sauna sessions run every half hour for 30 minutes. Cold plunges are 20 minutes, on the half hour.",
  },
  {
    n: "3",
    title: "Arrive & reset",
    copy: "Come 10 minutes early with your booking code. Towels, water and quiet are on us.",
  },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* ————————————————— hero ————————————————— */}
        <section className="relative flex min-h-svh items-center overflow-hidden">
          {/* warm ember glow, bottom left */}
          <div
            aria-hidden="true"
            className="drift absolute -bottom-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full opacity-70"
            style={{ background: "radial-gradient(circle, var(--glow) 0%, transparent 65%)" }}
          />
          {/* ghosted brand mark, right */}
          <LogoMark
            aria-hidden="true"
            className="pointer-events-none absolute -right-[8%] top-1/2 hidden w-[58%] -translate-y-1/2 text-gold opacity-[0.05] lg:block"
          />

          <div className="relative mx-auto w-full max-w-7xl px-6 pt-32 pb-20 lg:px-10">
            <Reveal>
              <p className="eyebrow">Private Wellness Club — Addis Ababa</p>
            </Reveal>

            <h1 className="display mt-8 text-[17vw] leading-[0.92] sm:text-[13vw] lg:text-[9.5rem]">
              <Reveal as="span" className="block" delay={80}>
                Move.
              </Reveal>
              <Reveal as="span" className="block pl-[8vw] lg:pl-36" delay={220}>
                Think.
              </Reveal>
              <Reveal as="span" className="block italic text-gold" delay={360}>
                Recover.
              </Reveal>
            </h1>

            <div className="mt-12">
              <Reveal delay={480} className="max-w-md">
                <p className="text-[17px] leading-relaxed text-muted">
                  A club built around heat, cold, and stillness — saunas,
                  ice baths, and space to reset in the heart of the city.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/book"
                    className="group flex h-13 items-center gap-2.5 rounded-full bg-gold px-8 text-[14px] font-semibold tracking-[0.04em] text-bg transition-colors duration-300 hover:bg-gold-bright"
                  >
                    Book a Session
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="#method"
                    className="flex h-13 items-center rounded-full border border-line px-8 text-[14px] font-medium text-ink transition-colors duration-300 hover:border-gold hover:text-gold"
                  >
                    The Method
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ————————————————— marquee ————————————————— */}
        <section aria-hidden="true" className="overflow-hidden border-y border-line-soft py-5">
          <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className="font-serif text-2xl italic text-muted">{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-gold/60" />
              </span>
            ))}
          </div>
        </section>

        {/* ————————————————— method ————————————————— */}
        <section id="method" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-28 lg:px-10 lg:py-36">
          <div className="grid gap-14 lg:grid-cols-[1fr_2fr]">
            <Reveal>
              <p className="eyebrow">The Go&rsquo;Buzz Method</p>
              <h2 className="display mt-6 text-5xl sm:text-6xl">
                A quieter, smarter <em className="text-gold">rhythm.</em>
              </h2>
              <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-muted">
                Strength, clarity and restoration — designed for Addis Ababa&rsquo;s
                next generation of intentional living.
              </p>
            </Reveal>

            <div>
              {method.map((m, i) => (
                <Reveal key={m.n} delay={i * 120}>
                  <article className="group grid gap-5 border-t border-line-soft py-10 transition-colors duration-500 first:border-t-0 first:pt-0 sm:grid-cols-[90px_1fr] lg:py-12">
                    <span className="font-serif text-2xl italic text-gold/70 transition-colors duration-500 group-hover:text-gold">
                      {m.n}
                    </span>
                    <div>
                      <h3 className="font-serif text-4xl font-medium sm:text-5xl">{m.title}</h3>
                      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted">{m.copy}</p>
                      <ul className="mt-5 flex flex-wrap gap-2.5">
                        {m.tags.map((t) => (
                          <li
                            key={t}
                            className="rounded-full border border-line-soft px-4 py-1.5 text-[12px] font-medium tracking-[0.08em] text-faint uppercase"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ————————————————— why go'buzz exists ————————————————— */}
        <section id="why" className="border-t border-line-soft">
          <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
              <Reveal>
                <p className="eyebrow">Why Go&rsquo;Buzz Exists</p>
                <h2 className="display mt-6 text-5xl sm:text-6xl">
                  Bringing transformation <em className="text-gold">home.</em>
                </h2>
              </Reveal>
              <Reveal delay={150} className="lg:border-l lg:border-line-soft lg:pl-16">
                <p className="font-serif text-[26px] leading-[1.45] sm:text-[30px]">
                  I grew up in Ethiopia and rebuilt myself in Australia. Through
                  fitness training, psychology, and years of working at the
                  intersection of physical and mental health, I came to understand
                  something simple: wellness is not a product. It is a practice.
                  I am bringing that practice home — to Addis Ababa — for the
                  first time.
                </p>
                <p className="mt-7 font-serif text-[26px] leading-[1.45] sm:text-[30px]">
                  Go&rsquo;buzz is not entering a market.{" "}
                  <em className="text-gold">It is creating one.</em>
                </p>
                <div className="mt-10 flex items-center gap-5">
                  <PulseLine className="w-20 text-gold" />
                  <p className="text-[12px] font-semibold tracking-[0.22em] text-muted uppercase">
                    Mack — Founder
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ————————————————— facilities ————————————————— */}
        <section id="facilities" className="scroll-mt-24 border-y border-line-soft bg-surface">
          <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-36">
            <Reveal className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">The Recovery Suite</p>
                <h2 className="display mt-6 text-5xl sm:text-6xl">
                  Heat &amp; <em className="text-gold">cold,</em> done properly.
                </h2>
              </div>
              <Link
                href="/book"
                className="group flex items-center gap-2 text-[14px] font-semibold text-gold transition-colors hover:text-gold-bright"
              >
                See live availability
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Reveal>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {/* sauna cards */}
              {[
                { name: "Men's Sauna", tagline: "Cedar-lined heat room, men only.", flip: false },
                { name: "Women's Sauna", tagline: "Cedar-lined heat room, women only.", flip: true },
              ].map((s, i) => (
                <Reveal key={s.name} delay={i * 120}>
                  <Link
                    href="/book"
                    className="group block overflow-hidden rounded-3xl border border-line-soft bg-raised transition-all duration-500 hover:border-line hover:shadow-(--shadow-warm)"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={publicAsset("/facilities/sauna.jpg")}
                        alt="Cedar-lined sauna behind a full-height glass wall"
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
                          s.flip ? "-scale-x-100" : ""
                        }`}
                      />
                      {/* tone the render into the theme */}
                      <div className="absolute inset-0 dark:bg-[#140f08]/45" />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-45"
                        style={{
                          background:
                            "radial-gradient(120% 90% at 50% 115%, rgba(201,120,40,0.55) 0%, rgba(201,168,76,0.2) 45%, transparent 72%)",
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-raised to-transparent" />
                      <Flame
                        aria-hidden="true"
                        className="absolute bottom-6 left-6 h-9 w-9 text-gold"
                        strokeWidth={1.4}
                      />
                      <span className="absolute top-5 right-5 rounded-full border border-line bg-bg/60 px-4 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-gold uppercase backdrop-blur">
                        30 min
                      </span>
                    </div>
                    <div className="p-7">
                      <h3 className="font-serif text-3xl font-medium">{s.name}</h3>
                      <p className="mt-2 text-[14px] text-muted">{s.tagline}</p>
                      <dl className="mt-6 flex items-center gap-6 border-t border-line-soft pt-5 text-[13px] text-muted">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-gold" aria-hidden="true" />
                          <dd>85°C</dd>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gold" aria-hidden="true" />
                          <dd>5 spots / session</dd>
                        </div>
                      </dl>
                    </div>
                  </Link>
                </Reveal>
              ))}

              {/* ice bath */}
              <Reveal delay={240}>
                <Link
                  href="/book"
                  className="group block overflow-hidden rounded-3xl border border-line-soft bg-raised transition-all duration-500 hover:border-line hover:shadow-(--shadow-warm)"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={publicAsset("/facilities/ice-bath.jpg")}
                      alt="Wood-clad single-occupancy ice bath with steps"
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 dark:bg-[#0a0d12]/45" />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-45"
                      style={{
                        background:
                          "radial-gradient(120% 90% at 50% 115%, rgba(96,140,190,0.5) 0%, rgba(140,170,200,0.16) 45%, transparent 72%)",
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-raised to-transparent" />
                    <Snowflake
                      aria-hidden="true"
                      className="absolute bottom-6 left-6 h-9 w-9 text-gold"
                      strokeWidth={1.4}
                    />
                    <span className="absolute top-5 right-5 rounded-full border border-line bg-bg/60 px-4 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-gold uppercase backdrop-blur">
                      20 min
                    </span>
                  </div>
                  <div className="p-7">
                    <h3 className="font-serif text-3xl font-medium">Ice Bath</h3>
                    <p className="mt-2 text-[14px] text-muted">The plunge is yours alone.</p>
                    <dl className="mt-6 flex items-center gap-6 border-t border-line-soft pt-5 text-[13px] text-muted">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-gold" aria-hidden="true" />
                        <dd>3°C</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gold" aria-hidden="true" />
                        <dd>Single occupancy</dd>
                      </div>
                    </dl>
                  </div>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ————————————————— booking ————————————————— */}
        <section id="booking" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-28 lg:px-10 lg:py-36">
          <Reveal className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="eyebrow">Book a Session</p>
              <h2 className="display mt-6 text-5xl sm:text-6xl">
                Three steps to <em className="text-gold">still.</em>
              </h2>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
                Live availability across both saunas and the ice bath — pick your
                time, and your spot is held with an instant confirmation code.
              </p>
            </div>
            <Link
              href="/book"
              className="group flex h-13 items-center gap-2.5 rounded-full bg-gold px-8 text-[14px] font-semibold tracking-[0.04em] text-bg transition-colors duration-300 hover:bg-gold-bright"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Reserve your spot
            </Link>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="h-full rounded-2xl border border-line-soft bg-raised p-7">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line font-serif text-lg text-gold">
                    {s.n}
                  </span>
                  <h3 className="mt-5 text-[16px] font-semibold">{s.title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{s.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ————————————————— membership ————————————————— */}
        <section id="membership" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-28 lg:px-10 lg:py-36">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow">Founding Access</p>
              <h2 className="display mt-6 text-5xl sm:text-6xl">
                Two hundred members. <em className="text-gold">No more.</em>
              </h2>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
                Go&rsquo;Buzz opens with a founding list of 200. Founding members set
                the culture of the club — and keep privileges the day the doors open.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Priority booking across the recovery suite",
                  "Founding rate, locked for life",
                  "First access to opening-week programming",
                ].map((perk) => (
                  <li key={perk} className="flex items-start gap-3.5 text-[15px] text-ink">
                    <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold" aria-hidden="true" />
                    {perk}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={160}>
              <div className="rounded-3xl border border-line-soft bg-surface p-8 sm:p-10">
                <div className="flex items-baseline justify-between">
                  <p className="font-serif text-6xl text-gold">200</p>
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-faint uppercase">
                    Founding places
                  </p>
                </div>
                <div className="hairline my-7" />
                <p className="text-[15px] leading-relaxed text-muted">
                  Join the private announcement list for founding membership
                  invitations, opening-week access, and first-look programming.
                </p>
                <div className="mt-7">
                  <FoundingForm />
                </div>
                <p className="mt-4 text-[12.5px] text-faint">
                  No noise. Just opening updates and founding member details.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ————————————————— quote ————————————————— */}
        <section className="border-t border-line-soft bg-surface">
          <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:py-36">
            <Reveal>
              <PulseLine className="mx-auto w-44 text-gold/70" />
              <blockquote className="display mt-10 text-4xl leading-[1.15] sm:text-6xl">
                This is not a gym. This is not a clinic.{" "}
                <em className="text-gold">This is Go&rsquo;Buzz.</em>
              </blockquote>
              <p className="eyebrow mt-10">Addis Ababa · Opening September 2026</p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
