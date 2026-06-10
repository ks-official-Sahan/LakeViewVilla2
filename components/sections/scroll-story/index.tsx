"use client";

import { useRef, useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/data/content";
import { trackContact } from "@/lib/analytics";
import { HeroText } from "./hero-text";
import { StoryReveal } from "./story-reveal";
import { BookingCallout } from "./booking-callout";

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

export function ScrollStory({ cmsHero }: ScrollStoryProps) {
  const headline = cmsHero?.headline || "Lake View Villa";
  const subheadline = cmsHero?.subheadline || "Where every morning belongs to the lagoon.";

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
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Phase 1: Scroll Pin timeline
      const heroPin = ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "+=130%",
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        onUpdate(self) {
          setCanvasProgress(self.progress);
        },
      });

      if (!prefersReduced) {
        // Unified text + canvas animations synced to scroll
        gsap.to(heroTextRef.current, {
          y: -120,
          opacity: 0,
          filter: "blur(6px)",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=65%",
            scrub: 0.6,
          },
        });

        // Canvas backdrop zoom with brightness shift
        gsap.fromTo(
          canvasWrapRef.current,
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 1.08,
            filter: "brightness(1.05)",
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=130%",
              scrub: 0.8,
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
    <div ref={wrapperRef} className="relative select-none bg-[var(--color-background)]">
      {/* Hero Section */}
      <section
        ref={heroRef}
        id="home"
        aria-label="Lake View Villa — hero"
        className="relative flex flex-col items-center justify-center h-svh w-full bg-[var(--color-charcoal)]"
      >
        <div ref={canvasWrapRef} className="absolute inset-0">
          <Suspense fallback={null}>
            <HeroCanvas scrollProgress={canvasProgress} />
          </Suspense>
          {/* Premium luxury vignette */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[var(--color-charcoal)]/85 via-[var(--color-charcoal)]/20 to-[var(--color-charcoal)]/90"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,165,90,0.04)_0%,transparent_65%)]"
          />
        </div>

        <div ref={heroTextRef} className="relative z-10 w-full h-full">
          <HeroText headline={headline} subheadline={subheadline} onBook={handleBook} />
        </div>
      </section>

      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-30" />

      {/* Story Section */}
      <StoryReveal />

      {/* Booking Callout */}
      <BookingCallout onBook={handleBook} />
    </div>
  );
}
