"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

interface BookingCalloutProps {
  onBook: () => void;
}

export function BookingCallout({ onBook }: BookingCalloutProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 35, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
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
      className="relative overflow-hidden py-24 md:py-32 bg-[var(--color-teal-dark)] border-t border-white/5"
    >
      {/* Ambient Sunset Gold radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(201,165,90,0.08) 0%, transparent 70%)",
        }}
      />

      <div ref={contentRef} className="relative z-10 lv-container text-center max-w-3xl mx-auto">
        <p className="flex items-center justify-center gap-3 mb-6">
          <span className="h-px w-5 bg-[var(--color-gold)]/20" />
          <span className="text-[10px] font-[var(--font-sans)] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            Direct Booking
          </span>
          <span className="h-px w-5 bg-[var(--color-gold)]/20" />
        </p>

        <h2
          className="font-[var(--font-display)] font-bold text-white leading-tight tracking-tight mb-6"
          style={{
            fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
            textShadow: "0 2px 20px rgba(11,32,39,0.5)",
          }}
        >
          Your lagoon.
          <br />
          <span className="text-[var(--color-gold)] italic font-[var(--font-serif)] font-normal">
            Your sanctuary.
          </span>
        </h2>

        <p className="text-white/60 font-[var(--font-sans)] text-base max-w-[48ch] mx-auto leading-relaxed mb-10 text-wrap-balance">
          Message us on WhatsApp for the best available rate and instant
          confirmation. No commission, no middlemen.
        </p>

        {/* Double-Bezel Button-in-Button CTA */}
        <div className="flex justify-center font-[var(--font-sans)]">
          <button
            onClick={onBook}
            aria-label="Check availability on WhatsApp"
            className="group relative flex h-14 items-center justify-between rounded-full bg-[var(--color-gold)] pl-8 pr-2 text-xs font-bold uppercase tracking-widest text-[var(--color-charcoal)] shadow-[0_8px_30px_rgba(201,165,90,0.25)] border border-[var(--color-gold)] hover:bg-white hover:border-white transition-all duration-500 hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Check Availability
            </span>
            <div className="h-10 w-10 rounded-full bg-black/[0.07] group-hover:bg-black/[0.03] flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="h-4.5 w-4.5 text-current" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
