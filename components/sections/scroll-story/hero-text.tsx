"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
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
  const subRef = useRef<HTMLSpanElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const headlineParts = headline.split(" ");
  const line1 = headlineParts.slice(0, -1).join(" ") || "Lake View";
  const line2 = headlineParts[headlineParts.length - 1] || "Villa";

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const tl = gsap.timeline({ delay: 0.2 });

      // Unified editorial entrance timeline
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 15, letterSpacing: "0.3em" },
        { opacity: 1, y: 0, letterSpacing: "0.22em", duration: 0.9, ease: "power4.out" },
        0
      )
        .fromTo(
          h1Ref.current?.querySelectorAll(".word-line") ?? [],
          { y: "110%" },
          { y: "0%", duration: 1.1, stagger: 0.15, ease: "power4.out" },
          "-=0.6"
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" },
          "-=0.7"
        )
        .fromTo(
          containerRef.current?.querySelector(".hero-image-card") ?? null,
          { opacity: 0, scale: 0.94, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1.3, ease: "power4.out" },
          "-=0.9"
        )
        .fromTo(
          ctaRowRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.8"
        )
        .fromTo(
          scrollHintRef.current,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "-=0.4"
        );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative z-10 flex min-h-svh w-full items-center justify-center py-20 px-4 sm:px-8 md:px-12 lv-container">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 w-full items-center">
        
        {/* Left Column: Asymmetric Editorial Typography Block */}
        <div className="col-span-1 md:col-span-10 lg:col-span-9 flex flex-col items-start text-left z-10">
          
          {/* Eyebrow Pill Badge with Double Bezel */}
          <div
            ref={eyebrowRef}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] dark:bg-white/[0.03] px-4 py-2 backdrop-blur-md"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-gold)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-gold)]"></span>
            </span>
            <p className="text-[10px] font-[var(--font-sans)] font-bold uppercase tracking-[0.22em] text-foreground/80">
              6.0244° N, 80.7937° E · Tangalle, Sri Lanka
            </p>
          </div>

          {/* Heading */}
          <h1
            ref={h1Ref}
            className="font-[var(--font-display)] font-bold tracking-tight text-foreground transition-colors duration-300"
            style={{ fontSize: "clamp(2.75rem, 5.5vw, 5.5rem)", lineHeight: 0.95 }}
          >
            <span className="block overflow-hidden py-1">
              <span className="word-line block">{line1}</span>
            </span>
            <span className="block overflow-hidden py-1">
              <span className="word-line block text-[var(--color-gold)] italic font-[var(--font-serif)]">
                {line2}
              </span>
            </span>
            
            {/* Subheadline nested in heading for semantic flow */}
            <span className="block overflow-hidden mt-6">
              <span
                ref={subRef}
                className="block font-[var(--font-sans)] font-normal text-foreground/60 leading-relaxed text-left max-w-xl transition-colors duration-300 text-wrap-balance"
                style={{ fontSize: "clamp(0.875rem, 1.2vw, 1.15rem)", letterSpacing: "0.02em" }}
              >
                {subheadline}
              </span>
            </span>
          </h1>

          {/* CTAs with nested Double-Bezel Button-in-Button */}
          <div
            ref={ctaRowRef}
            className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-4 w-full sm:w-auto font-[var(--font-sans)]"
          >
            <button
              onClick={onBook}
              className="group relative flex h-14 items-center justify-between rounded-full bg-[var(--color-gold)] pl-8 pr-2 text-xs font-bold uppercase tracking-widest text-[var(--color-charcoal)] shadow-[0_8px_30px_rgba(201,165,90,0.2)] border border-[var(--color-gold)] hover:bg-foreground hover:text-background hover:border-foreground dark:hover:bg-white dark:hover:border-white dark:hover:text-[var(--color-charcoal)] transition-all duration-500 hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Reserve Your Stay
              </span>
              <div className="h-10 w-10 rounded-full bg-black/[0.07] dark:bg-white/10 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4.5 w-4.5 text-current" />
              </div>
            </button>
            
            <Link
              href="/gallery"
              className="group relative h-14 px-8 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-foreground/75 border border-foreground/15 rounded-full transition-all duration-300 hover:text-foreground hover:border-foreground/45 hover:bg-foreground/[0.03]"
            >
              <span className="flex items-center gap-1.5">
                Explore Gallery
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Layered Double-Bezel Card Cascade (Commented out based on user feedback) */}
        {/*
        <div className="col-span-1 md:col-span-5 flex justify-center md:justify-end relative">
          <div 
            className="hero-image-card relative w-full max-w-[380px] aspect-[4/5] md:aspect-[3/4] p-2 rounded-[2.5rem] bg-foreground/[0.02] dark:bg-white/[0.02] border border-foreground/10 dark:border-white/10 transition-transform duration-500 hover:scale-[1.02]"
            style={{ viewTransitionName: "hero-featured-image" }}
          >
            <div className="relative w-full h-full rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] bg-card border border-foreground/5 dark:border-white/5">
              <Image
                src="/villa/optimized/drone_view_villa.webp"
                alt="Aerial view of Lake View Villa Tangalle Lagoon"
                fill
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 30vw"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
        */}

      </div>

      {/* Scroll Down Hint */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5"
      >
        <span className="text-[9px] uppercase tracking-[0.25em] text-foreground/35 font-semibold transition-colors duration-300">
          Scroll Down
        </span>
        <div className="relative h-8 w-[1.5px] overflow-hidden rounded-full bg-foreground/15 transition-colors duration-300">
          <div
            className="absolute inset-x-0 top-0 h-1/2 w-full bg-[var(--color-gold)]"
            style={{ animation: "scrollLine 2.0s cubic-bezier(0.76, 0, 0.24, 1) infinite" }}
          />
        </div>
      </div>
    </div>
  );
}
