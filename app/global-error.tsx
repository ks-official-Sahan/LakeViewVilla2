"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Custom inline SVG Warning Icon
const WarningIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

export default function GlobalError({ error, reset }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("[global-error]", error);
    try {
      const payload = JSON.stringify({
        type: "global-error",
        message: error?.message ?? "Unknown",
        digest: (error as any)?.digest,
        stack: error?.stack?.slice(0, 4_000),
        url: typeof location !== "undefined" ? location.href : "",
        ts: Date.now(),
      });
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        navigator.sendBeacon("/api/metrics", payload);
      } else {
        fetch("/api/metrics", {
          method: "POST",
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  }, [error]);

  const detail = useMemo(() => {
    const text = [
      `Message: ${error?.message ?? "—"}`,
      `Digest: ${(error as any)?.digest ?? "—"}`,
      process.env.NODE_ENV !== "production" && error?.stack
        ? `Stack:\n${error.stack}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    return text;
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex items-center justify-center bg-[#0b2027] text-[#f5f2e8] font-sans px-4 py-12 relative overflow-hidden isolate">
        {/* Background ambient radial gradients */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle 800px at 50% 30%, rgba(201,165,90,0.06), transparent 80%)",
          }}
        />
        <div className="absolute inset-0 -z-10 opacity-5 bg-[radial-gradient(#1a5c5e_1px,transparent_1px)] [background-size:16px_16px]" />

        <main className="w-full max-w-xl mx-auto border border-teal-900/40 bg-teal-950/20 p-8 text-center rounded-sm backdrop-blur-md relative space-y-6">
          {/* Brand Accent Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c9a55a] to-transparent" />

          <div className="inline-flex items-center justify-center rounded-sm bg-red-950/30 text-red-400 border border-red-900/30 p-4">
            <WarningIcon className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="font-[var(--font-display)] text-xs font-bold tracking-[0.3em] uppercase text-[#c9a55a] block">
              Global Error
            </span>
            <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl font-black text-[#f5f2e8]">
              Something Went Wrong
            </h1>
            <p className="text-sm text-[#7ba38c] leading-relaxed max-w-md mx-auto">
              An unexpected critical error occurred. You can retry the action or go back to the homepage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-3 rounded-sm bg-[#c9a55a] text-[#0b2027] hover:bg-[#d4b56e] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-5 py-3 rounded-sm border border-teal-800 text-[#7ba38c] hover:text-[#f5f2e8] hover:border-teal-700 text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center justify-center"
            >
              Go Home
            </a>
            <a
              href={`mailto:ks.official.sahan@gmail.com?subject=Site%20Error&body=Hi%2C%20I%20encountered%20an%20error%20on%20Lake%20View%20Villa.%0A%0A`}
              className="px-5 py-3 rounded-sm border border-teal-800 text-[#7ba38c] hover:text-[#f5f2e8] hover:border-teal-700 text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center justify-center"
            >
              Contact Support
            </a>
          </div>

          {/* Dev-friendly details (stack hidden in prod) */}
          <details className="text-left max-h-64 overflow-auto rounded-sm border border-teal-900/40 bg-teal-950/30 p-4">
            <summary className="cursor-pointer select-none text-xs font-bold uppercase tracking-wider text-[#c9a55a]">
              Error details
            </summary>
            <pre className="mt-3 text-xs font-mono text-teal-200/70 whitespace-pre-wrap break-words">
              {detail}
            </pre>
          </details>

          <div className="pt-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(detail);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {}
              }}
              className="text-xs underline underline-offset-4 text-[#7ba38c] hover:text-[#f5f2e8] transition-colors"
            >
              {copied ? "Copied!" : "Copy details to clipboard"}
            </button>
          </div>

          <div className="border-t border-teal-900/40 pt-6">
            <a
              className="inline-flex text-xs uppercase tracking-widest text-[#7ba38c] hover:text-[#f5f2e8] transition-colors"
              href="/developer"
            >
              ← Developer Info
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
