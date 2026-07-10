import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Database, LockKeyhole } from "lucide-react";
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
      <main data-admin className="flex min-h-svh items-center justify-center bg-bg px-6 py-16 text-ink">
        <section className="w-full max-w-lg rounded-xl border border-line-soft bg-surface p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold text-bg">
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
    <main data-admin className="min-h-svh bg-bg text-ink">
      <div className="mx-auto min-h-svh max-w-[1720px] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="bg-[#17150f] px-4 py-4 text-[#fffaf0] lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/admin"
              className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7b95d]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d2b45a] text-[13px] font-extrabold text-[#17150f]">
                G&apos;B
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-semibold">Go&apos;Buzz</span>
                <span className="block text-[11px] text-[#8f8777]">Wellness operations</span>
              </span>
            </Link>
            <ThemeToggle className="border-white/12 text-[#b9b09d] hover:border-[#d2b45a]/60 hover:text-[#d2b45a] lg:hidden" />
          </div>

          <div className="mt-4 border-t border-white/8 pt-3 lg:mt-8 lg:border-0 lg:pt-0">
            <AdminSidebarNav />
          </div>

          <div className="mt-auto hidden border-t border-white/8 pt-5 lg:block">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#8f8777]">
              <Activity className="h-3.5 w-3.5 text-[#d2b45a]" aria-hidden="true" />
              Workspace online
            </div>
            <p className="mt-2 truncate text-[12px] text-[#d5cdbd]" title={user.email ?? "Admin account"}>
              {user.email ?? "Admin account"}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#8f8777]">
              <Database className="h-3 w-3" aria-hidden="true" />
              {bookingBackend()} storage
            </p>
            <div className="mt-4 flex items-center gap-2">
              <ThemeToggle className="border-white/12 text-[#b9b09d] hover:border-[#d2b45a]/60 hover:text-[#d2b45a]" />
              <AdminSignOut className="flex-1 border-white/12 text-[#b9b09d] hover:border-[#d2b45a]/60 hover:text-[#d2b45a]" />
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="flex items-center justify-between border-b border-line-soft px-4 py-3 lg:hidden">
            <div>
              <p className="text-[12px] font-semibold">Admin workspace</p>
              <p className="text-[11px] text-muted">{bookingBackend()} storage</p>
            </div>
            <AdminSignOut className="h-9 px-3" />
          </header>
          <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-9 xl:px-12">{children}</div>
        </div>
      </div>
    </main>
  );
}
