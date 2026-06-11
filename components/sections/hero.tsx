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

  // Initialize timeOfDay dynamically to actual client local hour
  const [time, setTime] = useState(() => {
    if (typeof window !== "undefined") {
      const date = new Date();
      return date.getHours() + date.getMinutes() / 60;
    }
    return 12; // default to noon for SSR
  });

  const formatTime = (t: number) => {
    const h = Math.floor(t);
    const m = Math.floor((t - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const getTimeLabel = (t: number) => {
    if (t >= 5 && t < 9) return "Dawn";
    if (t >= 9 && t < 15) return "Morning";
    if (t >= 15 && t < 18) return "Afternoon";
    if (t >= 18 && t < 20) return "Sunset";
    if (t >= 20 || t < 5) return "Night";
    return "Midnight";
  };

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
            <HeroCanvas scrollProgress={canvasProgress} timeOfDay={time} />
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

        {/* Floating Time of Day Controller */}
        <div 
          className="absolute bottom-28 md:bottom-10 right-6 md:right-12 z-20 bg-card/75 border border-border/60 backdrop-blur-md p-4 rounded-sm shadow-xl w-60 text-foreground"
          style={{ transition: "background 0.3s ease, border-color 0.3s ease" }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-foreground/50">
              Interactive Time
            </span>
            <span className="text-xs font-mono font-bold text-accent">
              {formatTime(time)} <span className="opacity-60 text-[10px]">({getTimeLabel(time)})</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={23.9}
            step={0.1}
            value={time}
            onChange={(e) => setTime(parseFloat(e.target.value))}
            className="w-full accent-accent bg-foreground/10 h-1 rounded-sm appearance-none cursor-pointer focus:outline-none"
            aria-label="Adjust time of day"
          />
        </div>

        {/* Hero text content — centered, z-10 */}
        <div ref={heroTextRef} className="relative z-10 w-full h-full">
          <HeroText
            headline={headline}
            subheadline={subheadline}
            onBook={handleBook}
            isDark={isDark}
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
