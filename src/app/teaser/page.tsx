import type { Metadata } from "next";
import { ArrowDown, MapPin } from "lucide-react";
import { Hero } from "@/components/hero";
import { InvitationForm } from "@/components/invitation-form";
import { LogoMark } from "@/components/logo";
import { PulseLine } from "@/components/pulse-line";
import { Reveal } from "@/components/reveal";
import { TeaserNav } from "@/components/teaser-nav";
import { publicAsset } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Go'Buzz Wellness - Founding Invitations",
  description:
    "A private wellness club is taking shape in Addis Ababa. Request a limited founding invitation to Go'Buzz Wellness.",
};

export default function TeaserPage() {
  return (
    <>
      <TeaserNav />
      <main id="main">
        <Hero minimal />

        <section className="border-y border-line-soft bg-surface">
          <figure className="relative min-h-[72svh] overflow-hidden sm:min-h-[78svh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicAsset("/facilities/sauna.jpg")}
              alt="Cedar-lined sauna behind a full-height glass wall at Go'Buzz Wellness"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#0a0908]/28 dark:bg-[#0a0908]/48" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#0a0908]/90 via-[#0a0908]/42 to-transparent" aria-hidden="true" />
            <figcaption className="absolute inset-x-0 bottom-0 px-6 pb-10 text-[#fffdf7] sm:pb-14 lg:px-10 lg:pb-16">
              <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#d2b45a]">Opening in Addis Ababa</p>
                  <h2 className="mt-3 max-w-3xl font-serif text-[clamp(2.25rem,5.6vw,5.25rem)] leading-[1.02] tracking-[-0.025em] text-balance">
                    Something quieter is taking shape.
                  </h2>
                </div>
                <a
                  href="#invitation"
                  className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 text-[#fffdf7] transition-colors hover:border-[#d2b45a] hover:text-[#d2b45a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d2b45a]"
                  aria-label="Continue to founding invitations"
                >
                  <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
                </a>
              </div>
            </figcaption>
          </figure>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-10 lg:py-40">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">A new kind of club</p>
              <h2 className="display mt-6 max-w-lg text-5xl sm:text-6xl">
                Built for how Addis wants to <em className="text-gold">feel.</em>
              </h2>
            </Reveal>
            <Reveal delay={140} className="lg:border-l lg:border-line-soft lg:pl-16">
              <figure>
                <span aria-hidden="true" className="block h-12 font-serif text-[72px] leading-none text-gold/80">
                  &ldquo;
                </span>
                <blockquote className="max-w-2xl text-pretty font-serif text-[21px] leading-[1.62] sm:text-[25px]">
                  Wellness is not a product, it is a practice. Go&rsquo;Buzz is bringing that practice home.
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <PulseLine className="w-16 text-gold" />
                  <span>
                    <span className="block text-[12px] font-semibold text-ink">Mack</span>
                    <span className="mt-0.5 block text-[11px] text-muted">Founder, Go&rsquo;Buzz</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        <section id="invitation" className="flex min-h-[calc(100svh-5rem)] scroll-mt-20 items-center bg-[#0a0908] text-[#fffdf7]">
          <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10 lg:py-40">
            <Reveal>
              <p className="text-[11px] font-semibold text-[#d2b45a]">Founding access</p>
              <h2 className="mt-5 max-w-xl font-serif text-[clamp(3rem,6vw,5.75rem)] leading-[0.98] tracking-[-0.03em] text-balance">
                Limited spaces <em className="text-[#d2b45a]">only.</em>
              </h2>
              <p className="mt-7 max-w-md text-[15px] leading-7 text-[#b3a98f]">
                Founding members will be the first inside, with priority access to opening programming and membership invitations.
              </p>
              <div className="mt-8 flex items-center gap-2 text-[12px] text-[#8f8777]">
                <MapPin className="h-3.5 w-3.5 text-[#d2b45a]" aria-hidden="true" />
                Bole, Addis Ababa
              </div>
            </Reveal>

            <Reveal delay={140} className="border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-1">
              <div className="mb-8">
                <h3 className="text-[18px] font-semibold">Request your invitation</h3>
                <p className="mt-2 max-w-md text-[13px] leading-6 text-[#8f8777]">
                  Tell us where to reach you. Invitations will be released privately before opening.
                </p>
              </div>
              <InvitationForm />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#0a0908] text-[#fffdf7]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/8 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <LogoMark className="h-7 w-auto text-[#d2b45a]" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-[#756c56]">
            <a href="mailto:hello@gobuzzwellness.com" className="transition-colors hover:text-[#d2b45a]">hello@gobuzzwellness.com</a>
            <span>Go&rsquo;Buzz Wellness, Addis Ababa</span>
            <span>&copy; 2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
