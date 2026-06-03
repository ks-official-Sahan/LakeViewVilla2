"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  Suspense,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SITE_CONFIG, HERO_CONTENT } from "@/data/content";
import { trackContact } from "@/lib/analytics";

// ─── Dynamic canvas — never SSR ──────────────────────────────────────────────
const HeroCanvas = dynamic(() => import("@/components/webgl/HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

// ─── Register GSAP plugins once ──────────────────────────────────────────────
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Data ────────────────────────────────────────────────────────────────────
const VILLA_CARDS = [
  {
    src: "/villa/optimized/drone_view_villa.webp",
    alt: "Aerial view — Lake View Villa Tangalle and lagoon",
    label: "The Sanctuary",
    sub: "Tangalle Lagoon, Sri Lanka",
    span: "lg:col-span-2 lg:row-span-2",
    aspect: "aspect-[4/3]",
  },
  {
    src: "/villa/optimized/lake_img_02.webp",
    alt: "Serene lagoon at sunrise",
    label: "Lagoon Sunrise",
    sub: "Private waterfront",
    span: "lg:col-span-1",
    aspect: "aspect-square",
  },
  {
    src: "/villa/optimized/garden_img_01.webp",
    alt: "Lush tropical garden",
    label: "The Gardens",
    sub: "1,200 m² of tropical grounds",
    span: "lg:col-span-1",
    aspect: "aspect-square",
  },
  {
    src: "/villa/optimized/room_01_img_01.webp",
    alt: "Premium suite with lagoon view",
    label: "Master Suite",
    sub: "King bed · A/C · En-suite",
    span: "lg:col-span-1",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/villa/optimized/with_guests_04_dinning.webp",
    alt: "Guests dining al fresco",
    label: "Private Dining",
    sub: "Chef on request",
    span: "lg:col-span-1",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/villa/optimized/villa_outside_01.webp",
    alt: "Villa exterior — golden hour",
    label: "Golden Hour",
    sub: "Gated private estate",
    span: "lg:col-span-2",
    aspect: "aspect-[21/9]",
  },
];

const STATS = [
  { value: "4.9★", label: "Guest rating" },
  { value: "100%", label: "Privacy" },
  { value: "2 min", label: "To beach" },
  { value: "24/7", label: "On-call support" },
];

// ─── Component ───────────────────────────────────────────────────────────────

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

  const headlineParts = headline.split(" ");
  const line1 = headlineParts.slice(0, -1).join(" ") || "Lake View";
  const line2 = headlineParts[headlineParts.length - 1] || "Villa";

  // ── Refs ────────────────────────────────────────────────────────────────────
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const heroTextRef  = useRef<HTMLDivElement>(null);
  const eyebrowRef   = useRef<HTMLParagraphElement>(null);
  const h1Ref        = useRef<HTMLHeadingElement>(null);
  const ctaRowRef    = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const revealRef    = useRef<HTMLDivElement>(null);
  const storyHeadRef = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);

  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const statsRowRef  = useRef<HTMLDivElement>(null);

  const [canvasProgress, setCanvasProgress] = useState(0);

  // WhatsApp CTA
  const handleBook = useCallback(() => {
    const url = buildWhatsAppUrl(
      SITE_CONFIG.whatsappNumber,
      "Hi! I'd like to enquire about availability and rates at Lake View Villa Tangalle."
    );
    trackContact("whatsapp", url, "ScrollStory CTA");
    setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 80);
  }, []);

  // ── GSAP master timeline ─────────────────────────────────────────────────────
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // ── Phase 0: Hero entrance (load-time, no scroll) ────────────────────
      if (!prefersReduced) {
        const tl0 = gsap.timeline({ delay: 0.4 });
        tl0
          .fromTo(
            eyebrowRef.current,
            { opacity: 0, y: 20, letterSpacing: "0.35em" },
            { opacity: 1, y: 0, letterSpacing: "0.22em", duration: 1.0, ease: "power3.out" }
          )
          .fromTo(
            h1Ref.current?.querySelectorAll(".word-line") ?? [],
            { opacity: 0, y: 60, rotateX: 8, transformOrigin: "bottom center" },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 1.1,
              stagger: 0.18,
              ease: "expo.out",
            },
            "-=0.5"
          )
          .fromTo(
            ctaRowRef.current,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
            "-=0.6"
          )
          .fromTo(
            scrollHintRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.6 },
            "-=0.3"
          );
      }

      // ── Phase 1: Hero pin + canvas progress + text exit ──────────────────
      const heroPin = ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "+=120%",
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        onUpdate(self) {
          setCanvasProgress(self.progress);
        },
      });

      if (!prefersReduced) {
        // Text splits up as hero scrolls
        gsap.to(heroTextRef.current, {
          y: -120,
          opacity: 0,
          ease: "power2.in",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "+=60%",
            scrub: 0.5,
          },
        });

        // Canvas panel scales + fades to background
        gsap.fromTo(
          canvasWrapRef.current,
          { scale: 1 },
          {
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=120%",
              scrub: 1.2,
            },
          }
        );
      }

      // ── Phase 2: Reveal section — clip-path magazine expansion ──────────
      if (!prefersReduced) {
        // Story heading fades up
        gsap.fromTo(
          storyHeadRef.current,
          { opacity: 0, y: 56, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: {
              trigger: storyHeadRef.current,
              start: "top 82%",
              once: true,
            },
          }
        );

        // Each card reveals from clip-path: inset(0 0 100% 0) → inset(0 0 0% 0)
        const cards = gridRef.current?.querySelectorAll<HTMLElement>("[data-card]");
        if (cards?.length) {
          cards.forEach((card, i) => {
            const inner = card.querySelector<HTMLElement>("[data-card-inner]");
            if (!inner) return;

            gsap.fromTo(
              inner,
              { clipPath: "inset(0 0 100% 0)" },
              {
                clipPath: "inset(0 0 0% 0)",
                duration: 1.1,
                ease: "expo.out",
                delay: (i % 3) * 0.12,
                scrollTrigger: {
                  trigger: card,
                  start: "top 84%",
                  once: true,
                },
              }
            );

            // Image scale-in behind the clip reveal
            const img = inner.querySelector<HTMLElement>("img");
            if (img) {
              gsap.fromTo(
                img,
                { scale: 1.18 },
                {
                  scale: 1,
                  duration: 1.4,
                  ease: "expo.out",
                  delay: (i % 3) * 0.12,
                  scrollTrigger: {
                    trigger: card,
                    start: "top 84%",
                    once: true,
                  },
                }
              );
            }
          });
        }
      }

      // ── Phase 3: Parallax typography layer (background scroll 40% speed) ─
      if (!prefersReduced) {
        gsap.to(parallaxBgRef.current, {
          yPercent: -38,
          ease: "none",
          scrollTrigger: {
            trigger: revealRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      // Stats row entrance
      if (!prefersReduced) {
        const statItems = statsRowRef.current?.querySelectorAll<HTMLElement>(
          "[data-stat]"
        );
        if (statItems?.length) {
          gsap.fromTo(
            statItems,
            { opacity: 0, y: 32 },
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: statsRowRef.current,
                start: "top 86%",
                once: true,
              },
            }
          );
        }
      }

      return () => {
        heroPin.kill();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: wrapperRef }
  );

  // ── Scroll hint bounce ────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollHintRef.current;
    if (!el) return;
    const tl = gsap.to(el, {
      y: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      duration: 1.4,
    });
    return () => { tl.kill(); };
  }, []);

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div ref={wrapperRef}>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 1 — HERO (pinned, WebGL canvas + editorial text overlay)
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        id="home"
        aria-label="Lake View Villa — hero"
        className="relative h-[100svh] w-full overflow-hidden bg-[#0f1011]"
      >
        {/* WebGL canvas */}
        <div ref={canvasWrapRef} className="absolute inset-0">
          <Suspense fallback={null}>
            <HeroCanvas scrollProgress={canvasProgress} />
          </Suspense>
          {/* Luxury gradient scrims */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,16,17,.72) 0%, rgba(15,16,17,.22) 42%, rgba(15,16,17,.08) 68%, rgba(15,16,17,.65) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 120% 100% at 50% 100%, rgba(201,165,90,.08) 0%, transparent 65%)",
            }}
          />
        </div>

        {/* Editorial text overlay */}
        <div
          ref={heroTextRef}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6"
        >
          {/* Eyebrow */}
          <p
            ref={eyebrowRef}
            className="mb-[clamp(1rem,3vw,2rem)] text-[0.625rem] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a55a] opacity-0"
          >
            Tangalle, Sri Lanka · Private Lagoon Villa
          </p>

          {/* H1 — split into word-line spans for GSAP per-line reveal */}
          <h1
            ref={h1Ref}
            className="font-serif font-black leading-[1.0] tracking-[-0.025em] text-white overflow-hidden"
            style={{ fontSize: "clamp(3rem, 9vw, 8.5rem)" }}
            aria-label={headline}
          >
            <span
              className="word-line block opacity-0"
              style={{ perspective: "1200px" }}
            >
              {line1}
            </span>
            <span
              className="word-line block opacity-0 text-[#c9a55a] italic"
              style={{ perspective: "1200px", fontSize: "clamp(1.6rem, 5.5vw, 5.5rem)" }}
            >
              {line2}
            </span>
            <span
              className="word-line block opacity-0"
              style={{ perspective: "1200px", fontSize: "clamp(1rem, 2.5vw, 2.5rem)", letterSpacing: "0.05em", fontFamily: "var(--font-dm-sans)" }}
            >
              {subheadline}
            </span>
          </h1>

          {/* CTAs */}
          <div
            ref={ctaRowRef}
            className="mt-[clamp(2rem,4vw,3rem)] flex flex-col sm:flex-row items-center gap-4 opacity-0"
          >
            <button
              onClick={handleBook}
              aria-label="Book via WhatsApp"
              className="group relative overflow-hidden rounded-none border border-[#c9a55a] px-10 py-3.5 text-[0.75rem] sm:text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-[#c9a55a] transition-colors duration-300 hover:text-[#0f1011] hover:bg-[#c9a55a] shimmer-sweep"
            >
              Reserve Your Dates
            </button>
            <Link
              href="/gallery"
              className="text-[0.75rem] sm:text-[0.8125rem] font-medium uppercase tracking-[0.15em] text-white/70 underline underline-offset-4 decoration-white/25 hover:text-white hover:decoration-[#c9a55a] transition-colors duration-200"
            >
              View Gallery
            </Link>
          </div>

          {/* Scroll indicator */}
          <div
            ref={scrollHintRef}
            aria-hidden
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
          >
            <span className="text-[0.5625rem] uppercase tracking-[0.2em] text-white/40 font-medium">
              Scroll
            </span>
            <div className="relative h-8 w-px overflow-hidden bg-white/15">
              <div
                className="absolute inset-x-0 top-0 h-1/2 bg-[#c9a55a]"
                style={{ animation: "scrollLine 1.8s ease-in-out infinite" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 2 — REVEAL SECTION (editorial magazine clip-path cards)
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={revealRef}
        id="villa-story"
        aria-labelledby="story-heading"
        className="relative overflow-hidden bg-[var(--color-background)] border-t border-[var(--color-border)]/50"
      >
        {/* Phase 3 — parallax ghost typography (scrolls at 40% speed) */}
        <div
          ref={parallaxBgRef}
          aria-hidden
          className="pointer-events-none select-none absolute inset-x-0 top-[-8rem] z-0 text-center overflow-hidden"
          style={{ willChange: "transform" }}
        >
          <span
            className="block font-serif font-black text-[var(--color-foreground)]/[0.032] leading-none"
            style={{ fontSize: "clamp(6rem, 22vw, 20rem)", letterSpacing: "-0.04em" }}
          >
            SANCTUARY
          </span>
        </div>

        <div className="relative z-10 lv-container py-[clamp(4.5rem,10vw,8rem)]">
          {/* Editorial section heading */}
          <div ref={storyHeadRef} className="mb-[clamp(3rem,7vw,5.5rem)] max-w-2xl">
            <p className="flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-8 bg-[#c9a55a]" />
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-[#c9a55a]">
                The Villa
              </span>
            </p>
            <h2
              id="story-heading"
              className="font-serif font-black leading-[1.04] tracking-[-0.025em] text-[var(--color-foreground)]"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)" }}
            >
              A private{" "}
              <span className="italic text-[#c9a55a]">sanctuary</span>
              <br />
              on Sri Lanka's lagoon.
            </h2>
            <p className="mt-5 max-w-xl text-[var(--color-muted)] leading-relaxed text-[clamp(0.9rem,1.4vw,1.0625rem)]">
              Lake View Villa blends architectural precision with the raw, unhurried beauty of Tangalle. A rare escape where the lagoon is your living room and the sky your ceiling.
            </p>
          </div>

          {/* Magazine clip-path card grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3"
          >
            {VILLA_CARDS.map((card, i) => (
              <div
                key={card.src}
                data-card
                className={`relative ${card.span} overflow-hidden group`}
              >
                {/* Clip-path reveal wrapper */}
                <div
                  data-card-inner
                  className={`relative overflow-hidden ${card.aspect} bg-[#1a1a1a]`}
                  style={{ clipPath: "inset(0 0 100% 0)" }}
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes={
                      i === 0
                        ? "(max-width: 1024px) 100vw, 66vw"
                        : "(max-width: 640px) 100vw, 33vw"
                    }
                    quality={82}
                  />

                  {/* Scrim */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-[#0f1011]/80 via-[#0f1011]/10 to-transparent"
                  />

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 p-4 sm:p-5">
                    <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#c9a55a] mb-0.5">
                      {card.sub}
                    </p>
                    <h3 className="font-serif font-bold text-white text-sm sm:text-base leading-tight">
                      {card.label}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div
          ref={statsRowRef}
          className="relative z-10 lv-container pb-[clamp(4rem,8vw,6rem)]"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-[var(--color-border)]/50">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                data-stat
                className="px-6 py-8 border-r border-[var(--color-border)]/50 last:border-r-0 text-center sm:text-left"
              >
                <p
                  className="font-serif font-black text-[var(--color-foreground)] mb-1"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
                >
                  {s.value}
                </p>
                <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--color-muted)] font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 3 — BOOK CTA (typographic full-width panel)
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        aria-label="Booking call to action"
        className="relative overflow-hidden bg-[#0f1011] py-[clamp(5rem,12vw,9rem)]"
      >
        {/* Gold texture gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(201,165,90,.07) 0%, transparent 65%)",
          }}
        />

        <div className="relative lv-container text-center">
          <p className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-block h-px w-8 bg-[#c9a55a]/50" />
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-[#c9a55a]/80">
              Reserve
            </span>
            <span className="inline-block h-px w-8 bg-[#c9a55a]/50" />
          </p>

          <h2
            className="font-serif font-black text-white leading-[1.05] tracking-[-0.025em] mb-8"
            style={{ fontSize: "clamp(2.5rem, 7vw, 6.5rem)" }}
          >
            Your dates.
            <br />
            <span className="text-[#c9a55a] italic">Your lagoon.</span>
          </h2>

          <p className="mx-auto max-w-md text-white/55 text-[clamp(0.875rem,1.4vw,1rem)] leading-relaxed mb-10">
            Direct reservations receive personalised rates, priority check-in, and flexible cancellation — message us anytime.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleBook}
              aria-label="Book via WhatsApp"
              className="group relative overflow-hidden bg-[#c9a55a] px-12 py-4 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#0f1011] transition-all duration-300 hover:bg-[#d4b56e] btn-ripple"
            >
              Book via WhatsApp
            </button>
            <Link
              href="/stays"
              className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-white/50 hover:text-[#c9a55a] transition-colors duration-200"
            >
              View room details →
            </Link>
          </div>

          {/* OTA trust row */}
          <p className="mt-10 text-[0.625rem] uppercase tracking-[0.18em] text-white/25 font-medium">
            Also available on Booking.com · Airbnb
          </p>
        </div>
      </section>
    </div>
  );
}
