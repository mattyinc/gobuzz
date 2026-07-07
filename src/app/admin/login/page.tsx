import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
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

    if (user) redirect("/admin/bookings");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-2xl border border-line-soft bg-surface p-8 shadow-(--shadow-warm)">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-bg">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-7 text-2xl font-semibold">Go&apos;Buzz admin</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Sign in to view bookings, update session details, and manage guest status.
        </p>

        <div className="mt-8">
          {isSupabaseAuthConfigured() ? (
            <AdminLoginForm />
          ) : (
            <div className="rounded-xl border border-line-soft bg-raised p-5 text-[14px] leading-relaxed text-muted">
              Supabase auth is not configured yet. Add{" "}
              <code className="text-ink">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-ink">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment,
              then create an admin user in Supabase Auth.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
