"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

export default function BookingLinkPage() {
  const url = "https://www.booking.com/Pulse-81UlHU";
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.href = url;
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, url]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b2027] px-4 relative overflow-hidden isolate">
      {/* Background ambient radial gradients */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle 600px at 50% 30%, rgba(201,165,90,0.08), transparent 80%)",
        }}
      />
      <div className="absolute inset-0 -z-10 opacity-5 bg-[radial-gradient(#1a5c5e_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-md border border-teal-900/40 bg-teal-950/20 p-8 text-center rounded-sm backdrop-blur-md relative">
        {/* Brand Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c9a55a] to-transparent" />

        <span className="font-[var(--font-display)] text-xs font-bold tracking-[0.3em] uppercase text-[#c9a55a] block mb-2">
          Redirecting
        </span>
        <h1 className="font-[var(--font-display)] text-2xl font-black text-[#f5f2e8] mb-4">
          Lake View Villa — Booking.com
        </h1>
        <p className="text-sm text-[#7ba38c] mb-6 leading-relaxed">
          You are being redirected to our page on Booking.com. If the page
          does not load in {secondsLeft}s, click the button below.
        </p>

        {/* Geometric progress bar */}
        <div className="w-full h-[3px] bg-teal-950 rounded-full overflow-hidden mb-8 max-w-[200px] mx-auto">
          <div
            className="h-full bg-[#c9a55a] transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - secondsLeft) / 3) * 100}%` }}
          />
        </div>

        <div className="space-y-4">
          <a
            href={url}
            className="inline-flex w-full justify-center items-center px-6 py-3 border border-[#c9a55a] text-[#c9a55a] hover:bg-[#c9a55a] hover:text-[#0b2027] text-xs uppercase font-bold tracking-widest rounded-sm transition-all duration-300"
            data-cta="outbound-booking"
          >
            Open Booking.com
          </a>

          <Link
            href="/"
            className="inline-block text-xs uppercase tracking-widest text-[#7ba38c] hover:text-[#f5f2e8] transition-colors"
          >
            ← Back to website
          </Link>
        </div>
      </div>

      <Script id="link-schema-booking" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: "https://lakeviewvillatangalle.com/links/booking",
          name: "Lake View Villa — Booking.com",
          mainEntity: { "@type": "Thing", sameAs: url },
        })}
      </Script>
    </main>
  );
}
