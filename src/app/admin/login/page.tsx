import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarCheck2, ShieldCheck, Waves } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Login - Go'Buzz Wellness",
  description: "Private admin access for Go'Buzz Wellness booking management.",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (isSupabaseAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) redirect("/admin");
  }

  return (
    <main data-admin className="min-h-svh bg-bg text-ink lg:grid lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)]">
      <section className="flex min-h-[280px] flex-col justify-between bg-[#17150f] px-6 py-7 text-[#fffaf0] sm:px-10 lg:min-h-svh lg:px-12 lg:py-10 xl:px-16">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7b95d]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d2b45a] text-[13px] font-extrabold text-[#17150f]">G&apos;B</span>
            <span>
              <span className="block text-[15px] font-semibold">Go&apos;Buzz</span>
              <span className="block text-[10px] text-[#8f8777]">Wellness</span>
            </span>
          </Link>
          <ThemeToggle className="border-white/12 text-[#b9b09d] hover:border-[#d2b45a]/60 hover:text-[#d2b45a]" />
        </div>

        <div className="my-10 max-w-md lg:my-auto">
          <Waves className="h-7 w-7 text-[#d2b45a]" aria-hidden="true" />
          <p className="mt-6 text-[12px] font-semibold text-[#d2b45a]">Private workspace</p>
          <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.03em] sm:text-[38px]">
            The calm side of daily operations.
          </h1>
          <p className="mt-4 max-w-sm text-[14px] leading-6 text-[#b9b09d]">
            Manage every guest, room, and session from one focused view.
          </p>
          <div className="mt-8 hidden gap-5 text-[11px] text-[#8f8777] sm:flex">
            <span className="flex items-center gap-2"><CalendarCheck2 className="h-3.5 w-3.5 text-[#d2b45a]" aria-hidden="true" />Live booking view</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#d2b45a]" aria-hidden="true" />Secure access</span>
          </div>
        </div>

        <p className="hidden text-[10px] text-[#6f695d] lg:block">Go&apos;Buzz Wellness / Admin operations</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-gold">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Return to booking site
          </Link>
          <h2 className="mt-10 text-[26px] font-semibold tracking-[-0.02em]">Welcome back</h2>
          <p className="mt-2 text-[14px] leading-6 text-muted">Sign in with your admin account to continue.</p>

          <div className="mt-8">
            {isSupabaseAuthConfigured() ? (
              <AdminLoginForm />
            ) : (
              <div className="rounded-xl border border-line-soft bg-raised p-5 text-[13px] leading-6 text-muted">
                Supabase auth is not configured yet. Add <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-ink">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment, then create an admin user in Supabase Auth.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
