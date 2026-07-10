import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Database, LockKeyhole } from "lucide-react";
import { AdminSidebarNav } from "@/components/admin-sidebar-nav";
import { AdminSignOut } from "@/components/admin-sign-out";
import { ThemeToggle } from "@/components/theme-toggle";
import { bookingBackend } from "@/lib/booking-store";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseAuthConfigured()) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6 py-16">
        <section className="w-full max-w-lg rounded-2xl border border-line-soft bg-surface p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-bg">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <ThemeToggle />
          </div>
          <h1 className="mt-7 text-2xl font-semibold">Admin needs Supabase Auth</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Add the Supabase environment variables from <code className="text-ink">.env.example</code>{" "}
            and create an admin user in Supabase Auth. The public booking site can still use local
            SQLite while you set this up.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center rounded-full border border-line-soft px-5 text-[14px] font-medium text-muted transition-colors hover:border-gold hover:text-gold"
          >
            Back to site
          </Link>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <main className="min-h-svh bg-bg px-5 py-6 text-ink lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft pb-5">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-semibold text-gold">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Go&apos;Buzz</h1>
            <p className="mt-1 flex items-center gap-2 text-[14px] text-muted">
              <Database className="h-4 w-4" aria-hidden="true" />
              Storage: {bookingBackend()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AdminSignOut />
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="shrink-0 lg:sticky lg:top-6 lg:w-56">
            <AdminSidebarNav />
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
