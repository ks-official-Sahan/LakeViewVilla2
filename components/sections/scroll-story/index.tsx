"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/data/content";
import { trackContact } from "@/lib/analytics";
import { HeroText } from "./hero-text";
import { StoryReveal } from "./story-reveal";
import { BookingCallout } from "./booking-callout";

const HeroCanvas = dynamic(() => import("@/components/webgl/HeroCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#0b2027] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-teal-500/10 before:to-transparent" />
  ),
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

  // Time-of-day states
  const getLocalTime = () => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  };

  const [timeOfDay, setTimeOfDay] = useState(getLocalTime());
  const [isAutoTime, setIsAutoTime] = useState(true);

  // Auto time sync loop
  useEffect(() => {
    if (!isAutoTime) return;
    const interval = setInterval(() => {
      setTimeOfDay(getLocalTime());
    }, 20000); // sync every 20s
    return () => clearInterval(interval);
  }, [isAutoTime]);

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

  // UI helpers for time indicators
  const getTimeIcon = (h: number) => {
    if (h >= 5.0 && h < 7.5) return <Sunrise className="size-4 text-orange-400 animate-pulse" />;
    if (h >= 7.5 && h < 16.5) return <Sun className="size-4 text-[var(--color-gold)]" />;
    if (h >= 16.5 && h < 19.0) return <Sunset className="size-4 text-orange-400" />;
    return <Moon className="size-4 text-sky-200" />;
  };

  const formatTimeLabel = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.floor((h - hours) * 60);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  return (
    <div ref={wrapperRef} className="relative select-none bg-[var(--color-background)]">
      {/* Hero Section */}
      <section
        ref={heroRef}
        id="home"
        aria-label="Lake View Villa — hero"
        className="relative flex flex-col items-center justify-center h-svh w-full bg-[var(--hero-bg)] transition-colors duration-300"
      >
        <div ref={canvasWrapRef} className="absolute inset-0">
          <Suspense fallback={null}>
            <HeroCanvas scrollProgress={canvasProgress} timeOfDay={timeOfDay} />
          </Suspense>
          
          {/* Premium luxury vignette */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[var(--hero-overlay-from)] via-[var(--hero-overlay-via)] to-[var(--hero-overlay-to)] transition-colors duration-300"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,165,90,0.04)_0%,transparent_65%)]"
          />
        </div>

        <div ref={heroTextRef} className="relative z-10 w-full h-full">
          <HeroText headline={headline} subheadline={subheadline} onBook={handleBook} />
        </div>

        {/* Floating Time-of-Day Controller (Premium UX overlay) */}
        <div className="absolute bottom-6 right-6 md:right-8 z-20 flex items-center gap-3 bg-[var(--glass-2-bg)] backdrop-blur-xl border border-[var(--glass-2-border)] rounded-full px-4 py-2.5 shadow-2xl hover:scale-[1.01] transition-transform duration-300">
          <button
            onClick={() => {
              if (!isAutoTime) {
                setIsAutoTime(true);
                setTimeOfDay(getLocalTime());
              } else {
                setIsAutoTime(false);
              }
            }}
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full transition-all duration-300 ${
              isAutoTime
                ? "bg-[var(--color-gold)] text-[var(--color-charcoal)] shadow-[0_2px_10px_rgba(201,165,90,0.3)]"
                : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            Auto
          </button>
          
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            {getTimeIcon(timeOfDay)}
            <span className="text-[10px] font-bold text-white/90 min-w-[70px]">
              {formatTimeLabel(timeOfDay)}
            </span>
            <input
              type="range"
              min="0"
              max="23.9"
              step="0.1"
              value={timeOfDay}
              onChange={(e) => {
                setIsAutoTime(false);
                setTimeOfDay(parseFloat(e.target.value));
              }}
              className="w-20 md:w-28 h-1 rounded-full bg-white/20 accent-[var(--color-gold)] appearance-none cursor-pointer outline-none hover:bg-white/30 transition-colors"
              style={{
                WebkitAppearance: "none",
              }}
            />
          </div>
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
