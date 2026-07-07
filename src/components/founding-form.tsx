"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function FoundingForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-raised px-6 py-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-bg">
          <Check className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-[15px] font-semibold">You&rsquo;re on the list.</p>
          <p className="text-[13px] text-muted">
            We&rsquo;ll write only when it matters — opening dates and founding invitations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="founding-email" className="sr-only">
        Email address
      </label>
      <input
        id="founding-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-13 flex-1 rounded-full border border-line bg-raised px-6 text-[15px] text-ink placeholder:text-faint focus:border-gold focus:outline-none"
      />
      <button
        type="submit"
        className="group flex h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-8 text-[14px] font-semibold tracking-[0.04em] text-bg transition-colors duration-300 hover:bg-gold-bright"
      >
        Request an invitation
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </form>
  );
}
