"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { sanitizeAdminCallbackUrl } from "@/lib/auth/safe-callback-url";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = sanitizeAdminCallbackUrl(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
            Lake View Villa
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-lg"
        >
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-foreground)]">
            Sign in to continue
          </h2>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm backdrop-blur-sm shadow-[0_4px_20px_-4px_rgba(220,38,38,0.1)] transition-all animate-in fade-in duration-300"
            >
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
                <span className="text-xs font-bold font-sans">✕</span>
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-red-700 dark:text-red-400">Authentication Failed</p>
                <p className="text-xs text-[var(--color-muted)]">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="admin@lakeviewvilla.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)] transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
          Access restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
