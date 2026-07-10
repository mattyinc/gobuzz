"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-[12px] font-semibold text-muted">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@company.com"
          className="h-11 w-full rounded-xl border border-line-soft bg-surface px-4 text-[14px] outline-none transition-colors placeholder:text-faint hover:border-line focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-2 block text-[12px] font-semibold text-muted">
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-xl border border-line-soft bg-surface px-4 pr-11 text-[14px] outline-none transition-colors hover:border-line focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-faint transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-700 dark:text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-6 text-[13px] font-semibold text-bg transition-colors hover:bg-gold-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        )}
        Sign in
        {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
    </form>
  );
}
