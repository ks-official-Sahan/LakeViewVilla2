"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP, EASE } from "@/lib/gsap";
import { ArrowUpRight, ArrowRight } from "lucide-react";

interface HeroTextProps {
  headline: string;
  subheadline: string;
  onBook: () => void;
}

export function HeroText({ headline, subheadline, onBook }: HeroTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const headlineParts = headline.split(" ");
  const line1 = headlineParts.slice(0, -1).join(" ") || "Lake View";
  const line2 = headlineParts[headlineParts.length - 1] || "Villa";

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const tl = gsap.timeline({ delay: 0.3 });

      // Unified entrance animation
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 20, letterSpacing: "0.4em" },
        { opacity: 1, y: 0, letterSpacing: "0.22em", duration: 1.0, ease: "power4.out" },
        0
      )
        .fromTo(
          h1Ref.current?.querySelectorAll(".word-line") ?? [],
          { opacity: 0, y: 60, rotateX: 12, transformOrigin: "bottom center" },
          { opacity: 1, y: 0, rotateX: 0, duration: 1.2, stagger: 0.15, ease: "expo.out" },
          "-=0.5"
        )
        .fromTo(
          ctaRowRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
          "-=0.5"
        )
        .fromTo(
          scrollHintRef.current,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.4"
        );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-center">
      {/* Location Pill / Eyebrow */}
      <div
        ref={eyebrowRef}
        className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)] flex-shrink-0" />
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
          Tangalle Lagoon
        </p>
      </div>

      {/* Heading */}
      <h1
        ref={h1Ref}
        className="font-[var(--font-serif)] font-black tracking-tight text-white"
        style={{ fontSize: "clamp(2.75rem, 8vw, 7rem)", lineHeight: 0.95 }}
      >
        <span className="word-line block">{line1}</span>
        <span className="word-line block text-[var(--color-gold)] italic">
          {line2}
        </span>
        <span
          className="word-line mt-4 sm:mt-6 block font-[var(--font-sans)] font-medium text-white/60"
          style={{ fontSize: "clamp(0.875rem, 2vw, 1.25rem)", letterSpacing: "0.05em" }}
        >
          {subheadline}
        </span>
      </h1>

      {/* CTAs */}
      <div
        ref={ctaRowRef}
        className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
      >
        <button
          onClick={onBook}
          className="group relative flex h-12 sm:h-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-gold)] px-8 sm:px-10 text-xs font-bold uppercase tracking-widest text-[var(--color-charcoal)] shadow-[0_4px_20px_rgba(201,165,90,0.2)] transition-all duration-500 hover:bg-white hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(255,255,255,0.3)] active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-1.5">
            <span>Reserve Your Stay</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </span>
        </button>
        <Link
          href="/gallery"
          className="group relative h-12 sm:h-14 px-8 sm:px-10 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-white/70 border border-white/10 rounded-full transition-all duration-300 hover:text-white hover:border-white/30 hover:bg-white/5"
        >
          <span className="flex items-center gap-1.5">
            Explore Gallery
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      {/* Scroll Down Hint */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5"
      >
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/30 font-semibold">
          Scroll Down
        </span>
        <div className="relative h-8 w-[1.5px] overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-x-0 top-0 h-1/2 w-full bg-[var(--color-gold)]"
            style={{ animation: "scrollLine 2.0s cubic-bezier(0.76, 0, 0.24, 1) infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
