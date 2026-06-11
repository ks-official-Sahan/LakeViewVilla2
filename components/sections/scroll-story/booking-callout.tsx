"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface BookingCalloutProps {
  onBook: () => void;
}

/**
 * BookingCallout — Final conversion section
 *
 * Dark lagoon background, centered CTA.
 * Scroll-driven reveal with subtle gold glow.
 */
export function BookingCallout({ onBook }: BookingCalloutProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Reservations"
      className="relative overflow-hidden py-20 md:py-28 bg-[#0a0c0e] border-t border-white/[0.04]"
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(201,165,90,0.08) 0%, transparent 60%)",
        }}
      />

      <div ref={contentRef} className="relative z-10 lv-container text-center max-w-3xl mx-auto">
        <p className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-5 bg-[var(--color-gold)]/30" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            Direct Booking
          </span>
          <span className="h-px w-5 bg-[var(--color-gold)]/30" />
        </p>

        <h2
          className="font-[var(--font-display)] font-black text-white leading-tight tracking-tight mb-6"
          style={{
            fontSize: "clamp(2.25rem, 5vw, 4rem)",
            textShadow: "0 2px 16px rgba(0,0,0,0.4)",
          }}
        >
          Your lagoon.
          <br />
          <span className="text-[var(--color-gold)] italic font-[var(--font-serif)]">
            Your sanctuary.
          </span>
        </h2>

        <p className="text-white/50 text-base max-w-[48ch] mx-auto leading-relaxed mb-10">
          Message us on WhatsApp for the best available rate and instant
          confirmation. No commission, no middlemen.
        </p>

        <div className="flex justify-center">
          <button
            onClick={onBook}
            aria-label="Check availability on WhatsApp"
            className="group relative flex h-12 sm:h-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-gold)] px-8 sm:px-10 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-charcoal)] shadow-[0_6px_28px_rgba(201,165,90,0.25)] transition-all duration-400 hover:bg-[var(--color-gold-light)] hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(201,165,90,0.4)] active:scale-[0.97]"
          >
            <span>Check Availability on WhatsApp</span>
            {/* Shimmer sweep */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
