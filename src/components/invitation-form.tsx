"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "duplicate" | "error";

export function InvitationForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          website: formData.get("website"),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.error ?? "We could not save your request. Please try again.");
        setState("error");
        return;
      }

      setState(data.alreadyExists ? "duplicate" : "success");
      form.reset();
    } catch {
      setMessage("We could not reach the invitation list. Check your connection and try again.");
      setState("error");
    }
  }

  if (state === "success" || state === "duplicate") {
    return (
      <div role="status" className="border-y border-[#c9a84c]/25 py-7">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c9a84c] text-[#0a0908]">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-[#fffdf7]">
              {state === "duplicate" ? "Your request is already with us." : "Your invitation request is in."}
            </p>
            <p className="mt-1 max-w-md text-[13px] leading-6 text-[#b3a98f]">
              We will contact you when founding invitations are released. No noise, no weekly newsletter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">Your name</span>
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Full name"
            className="h-12 w-full rounded-xl border border-white/12 bg-white/4 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] hover:border-white/20 focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">Email address</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={160}
            placeholder="you@example.com"
            className="h-12 w-full rounded-xl border border-white/12 bg-white/4 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] hover:border-white/20 focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">
          Phone <span className="font-normal text-[#756c56]">(optional)</span>
        </span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          placeholder="+251"
          className="h-12 w-full rounded-xl border border-white/12 bg-white/4 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] hover:border-white/20 focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20"
        />
      </label>
      <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {state === "error" && (
        <p role="alert" className="text-[13px] leading-6 text-red-300">{message}</p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[11px] leading-5 text-[#756c56]">
          By requesting access, you agree to receive invitation and opening updates from Go&rsquo;Buzz.
        </p>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="group flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#c9a84c] px-6 text-[13px] font-semibold text-[#0a0908] transition-colors hover:bg-[#e0c47a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a84c] disabled:cursor-wait disabled:opacity-65"
        >
          {state === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {state === "submitting" ? "Sending request" : "Request an invitation"}
          {state !== "submitting" && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
