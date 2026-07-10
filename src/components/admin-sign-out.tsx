"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function AdminSignOut({ className }: { className?: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className={cn(
        "flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line-soft px-4 text-[13px] font-medium text-muted transition-colors hover:border-line hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        className
      )}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sign out
    </button>
  );
}
