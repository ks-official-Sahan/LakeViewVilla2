import Link from "next/link";

export default function NotFound() {
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

      <div className="w-full max-w-xl border border-teal-900/40 bg-teal-950/20 p-8 text-center rounded-sm backdrop-blur-md relative space-y-8">
        {/* Brand Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c9a55a] to-transparent" />

        <div className="space-y-4">
          <div className="inline-flex items-center justify-center rounded-sm bg-teal-950/40 border border-teal-900/40 px-6 py-3">
            <span className="text-5xl font-black tracking-widest text-[#c9a55a]">404</span>
          </div>
          <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl font-black text-[#f5f2e8]">
            Page Not Found
          </h1>
          <p className="text-sm text-[#7ba38c] leading-relaxed max-w-sm mx-auto">
            The page you are looking for does not exist, was renamed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action button options */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/"
            transitionTypes={["spa-page"]}
            className="flex items-center justify-center px-4 py-3 bg-[#c9a55a] text-[#0b2027] hover:bg-[#d4b56e] text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/gallery"
            transitionTypes={["spa-page"]}
            className="flex items-center justify-center px-4 py-3 border border-teal-800 text-[#7ba38c] hover:text-[#f5f2e8] hover:border-teal-700 text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
          >
            View Gallery
          </Link>
          <Link
            href="/stays"
            transitionTypes={["spa-page"]}
            className="flex items-center justify-center px-4 py-3 border border-teal-800 text-[#7ba38c] hover:text-[#f5f2e8] hover:border-teal-700 text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
          >
            See Stays
          </Link>
          <Link
            href="/developer"
            transitionTypes={["spa-page"]}
            className="flex items-center justify-center px-4 py-3 border border-teal-800 text-[#7ba38c] hover:text-[#f5f2e8] hover:border-teal-700 text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
          >
            Developer
          </Link>
        </div>

        {/* Footer shortcuts */}
        <p className="text-xs text-[#7ba38c] border-t border-teal-900/40 pt-6">
          Or visit{" "}
          <Link href="/faq" transitionTypes={["spa-page"]} className="underline underline-offset-4 hover:text-[#f5f2e8]">
            FAQ
          </Link>{" "}
          •{" "}
          <Link href="/visit" transitionTypes={["spa-page"]} className="underline underline-offset-4 hover:text-[#f5f2e8]">
            How to visit
          </Link>
        </p>
      </div>
    </main>
  );
}
