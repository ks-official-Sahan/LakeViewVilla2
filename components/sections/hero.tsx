"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/data/content";
import { trackContact } from "@/lib/analytics";
import { HeroText } from "./scroll-story/hero-text";
import { StoryReveal } from "./scroll-story/story-reveal";
import { BookingCallout } from "./scroll-story/booking-callout";

const HeroCanvas = dynamic(() => import("@/components/webgl/HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

interface ScrollStoryProps {
  cmsHero?: {
    headline?: string;
    subheadline?: string;
    ctaLabel?: string;
    ctaHref?: string;
  };
}

/**
 * ScrollStory — Hero + StoryReveal + BookingCallout
 *
 * Cinematic scroll-driven hero with 3-phase timeline:
 *   Phase 1 (0-30%): Entrance — text reveal, WebGL fade-in
 *   Phase 2 (30-70%): Exploration — parallax drift, content breathes
 *   Phase 3 (70-100%): Exit — elegant fade, next section emerges
 *
 * Layout: full-viewport hero, perfectly centered content, zero overflow.
 * Animation: GSAP ScrollTrigger with scrub, respects prefers-reduced-motion.
 */
export function ScrollStory({ cmsHero }: ScrollStoryProps) {
  const headline = cmsHero?.headline || "Lake View Villa";
  const subheadline =
    cmsHero?.subheadline || "Where every morning belongs to the lagoon.";

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light"; // dark or system-with-dark = dark

  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);

  const [canvasProgress, setCanvasProgress] = useState(0);

  const handleBook = useCallback(() => {
    const url = buildWhatsAppUrl(
      SITE_CONFIG.whatsappNumber,
      "Hi! I'd like to enquire about availability and rates at Lake View Villa Tangalle."
    );
    trackContact("whatsapp", url, "ScrollStory CTA");
    setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 80);
  }, []);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // ── Phase 1: Pin hero during scroll ──────────────────────────────────
      const heroPin = ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "+=140%",
        pin: true,
        pinSpacing: true,
        scrub: 0.7,
        onUpdate(self) {
          setCanvasProgress(self.progress);
        },
      });

      if (!prefersReduced) {
        // ── Text exit: fade + blur as user scrolls ──────────────────────
        gsap.to(heroTextRef.current, {
          y: -80,
          opacity: 0,
          filter: "blur(8px)",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=70%",
            scrub: 0.5,
          },
        });

        // ── Canvas: subtle zoom + brightness shift ───────────────────────
        gsap.fromTo(
          canvasWrapRef.current,
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 1.06,
            filter: "brightness(1.08)",
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=140%",
              scrub: 0.7,
            },
          }
        );
      }

      return () => {
        heroPin.kill();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: wrapperRef }
  );

  return (
    <div
      ref={wrapperRef}
      className="relative select-none bg-[var(--color-background)]"
    >
      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION — Full viewport, WebGL background, centered text
          ════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        id="home"
        aria-label="Lake View Villa — hero"
        className="relative flex flex-col items-center justify-center h-[100dvh] w-full overflow-hidden bg-[#0a0c0e]"
      >
        {/* WebGL canvas background */}
        <div ref={canvasWrapRef} className="absolute inset-0">
          <Suspense fallback={null}>
            <HeroCanvas scrollProgress={canvasProgress} />
          </Suspense>

          {/* Cinematic vignette — stronger in light mode for text contrast */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#0a0c0e]/80 via-[#0a0c0e]/15 to-[#0a0c0e]/85"
            style={{
              opacity: isDark ? 1 : 0.85,
            }}
          />
          {/* Light-mode compensation overlay — darkens the bright WebGL */}
          {!isDark && (
            <div
              aria-hidden
              className="absolute inset-0 bg-[#0a0c0e]/40"
            />
          )}

          {/* Warm lagoon glow — radial center accent */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(201,165,90,0.06)_0%,transparent_60%)]"
          />
        </div>

        {/* Hero text content — centered, z-10 */}
        <div ref={heroTextRef} className="relative z-10 w-full h-full">
          <HeroText
            headline={headline}
            subheadline={subheadline}
            onBook={handleBook}
          />
        </div>
      </section>

      {/* Gold divider line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-gold)]/25 to-transparent" />

      {/* ════════════════════════════════════════════════════════════════════
          STORY REVEAL — Editorial section below hero
          ════════════════════════════════════════════════════════════════════ */}
      <StoryReveal />

      {/* ════════════════════════════════════════════════════════════════════
          BOOKING CALLOUT — Final conversion section
          ════════════════════════════════════════════════════════════════════ */}
      <BookingCallout onBook={handleBook} />
    </div>
  );
}
