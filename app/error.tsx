"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b2027] px-4 relative overflow-hidden isolate">
      {/* Background ambient radial gradients */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle 800px at 50% 30%, rgba(201,165,90,0.06), transparent 80%)",
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-5 bg-[radial-gradient(#1a5c5e_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-md border border-teal-900/40 bg-teal-950/20 p-8 text-center rounded-sm backdrop-blur-md relative space-y-6">
        {/* Brand Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c9a55a] to-transparent" />

        <div className="space-y-2">
          <span className="font-[var(--font-display)] text-xs font-bold tracking-[0.3em] uppercase text-[#c9a55a] block">
            System Error
          </span>
          <h1 className="font-[var(--font-display)] text-2xl font-black text-[#f5f2e8]">
            Something Went Wrong
          </h1>
          <p className="text-sm text-[#7ba38c] leading-relaxed">
            An unexpected error occurred during your visit. We apologize for the inconvenience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 px-5 py-3 bg-[#c9a55a] text-[#0b2027] hover:bg-[#d4b56e] text-xs font-bold uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex justify-center items-center px-5 py-3 border border-teal-800 text-[#7ba38c] hover:text-[#f5f2e8] hover:border-teal-700 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
          >
            Go Home
          </Link>
        </div>

        {error.digest && (
          <p className="text-[10px] text-teal-800/80 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
