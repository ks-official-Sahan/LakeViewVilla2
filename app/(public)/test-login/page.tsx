"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { sanitizeAdminCallbackUrl } from "@/lib/auth/safe-callback-url";
import Link from "next/link";

// Custom inline SVG icons
const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

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
    <div className="flex min-h-svh items-center justify-center bg-[#0b2027] px-4 relative overflow-hidden isolate">
      {/* Background ambient radial gradients */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle 800px at 50% 30%, rgba(201,165,90,0.06), transparent 80%)",
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-5 bg-[radial-gradient(#1a5c5e_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="mb-8 text-center space-y-2">
          <span className="font-[var(--font-display)] text-xs font-bold tracking-[0.3em] uppercase text-[#c9a55a] block">
            Secure Access
          </span>
          <h1 className="font-[var(--font-display)] text-2xl font-black tracking-tight text-[#f5f2e8]">
            Lake View Villa
          </h1>
          <p className="text-xs tracking-widest text-[#7ba38c] uppercase font-mono">
            Control Panel Login
          </p>
        </div>

        {/* Card Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-sm border border-teal-900/40 bg-teal-950/20 p-8 shadow-2xl backdrop-blur-md relative"
        >
          {/* Accent Top Bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c9a55a] to-transparent" />

          <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-[#f5f2e8] flex items-center gap-2 justify-center">
            <LockIcon className="h-4 w-4 text-[#c9a55a]" /> Sign in to continue
          </h2>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-sm border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-400 text-center"
            >
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#7ba38c]"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-teal-900/40 bg-teal-950/30 px-4 py-2.5 text-sm text-[#f5f2e8] outline-none transition-all focus:border-[#c9a55a] focus:ring-1 focus:ring-[#c9a55a]"
                placeholder="admin@lakeviewvilla.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#7ba38c]"
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
                className="w-full rounded-sm border border-teal-900/40 bg-teal-950/30 px-4 py-2.5 text-sm text-[#f5f2e8] outline-none transition-all focus:border-[#c9a55a] focus:ring-1 focus:ring-[#c9a55a]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full cursor-pointer items-center justify-center rounded-sm bg-[#c9a55a] hover:bg-[#d4b56e] text-[#0b2027] px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#c9a55a]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#0b2027] border-t-transparent" />
            ) : (
              "Authenticate"
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-[#7ba38c]">
            Access restricted to authorized personnel only.
          </p>
          <Link
            href="/"
            className="inline-block text-xs uppercase tracking-widest text-[#7ba38c] hover:text-[#f5f2e8] transition-colors"
          >
            ← Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-[#0b2027]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9a55a] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
