"use client";

import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/data/content";
import { trackContact } from "@/lib/analytics";
import { Star, ArrowUpRight, Compass, ShieldCheck } from "lucide-react";

// Dynamic canvas
const HeroCanvas = dynamic(() => import("@/components/webgl/HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const VILLA_CARDS = [
  {
    src: "/villa/optimized/drone_view_villa.webp",
    alt: "Aerial view — Lake View Villa Tangalle and lagoon",
    label: "The Sanctuary",
    sub: "Tangalle Lagoon, Sri Lanka",
    span: "lg:col-span-2 lg:row-span-2",
    aspect: "aspect-[4/3] md:aspect-auto md:h-full",
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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const ctaRowRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const revealRef = useRef<HTMLDivElement>(null);
  const storyHeadRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const statsRowRef = useRef<HTMLDivElement>(null);

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

      // Phase 0: Hero entrance animations
      if (!prefersReduced) {
        const tl0 = gsap.timeline({ delay: 0.4 });
        tl0
          .fromTo(
            eyebrowRef.current,
            { opacity: 0, y: 30, letterSpacing: "0.4em" },
            { opacity: 1, y: 0, letterSpacing: "0.22em", duration: 1.2, ease: "power4.out" }
          )
          .fromTo(
            h1Ref.current?.querySelectorAll(".word-line") ?? [],
            { opacity: 0, y: 80, rotateX: 15, transformOrigin: "bottom center" },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 1.3,
              stagger: 0.2,
              ease: "expo.out",
            },
            "-=0.7"
          )
          .fromTo(
            ctaRowRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
            "-=0.6"
          )
          .fromTo(
            scrollHintRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
            "-=0.4"
          );
      }

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
        // Text exits upwards with blur
        gsap.to(heroTextRef.current, {
          y: -150,
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

        // WebGL container zooms out slightly into view
        gsap.fromTo(
          canvasWrapRef.current,
          { scale: 1 },
          {
            scale: 1.1,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=130%",
              scrub: 1.0,
            },
          }
        );
      }

      // Phase 2: Asymmetric magazine cards staggered reveals
      if (!prefersReduced) {
        gsap.fromTo(
          storyHeadRef.current,
          { opacity: 0, y: 60, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: {
              trigger: storyHeadRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );

        const cards = gridRef.current?.querySelectorAll<HTMLElement>("[data-card]");
        if (cards?.length) {
          cards.forEach((card, i) => {
            const inner = card.querySelector<HTMLElement>("[data-card-inner]");
            if (!inner) return;

            gsap.fromTo(
              inner,
              { clipPath: "inset(100% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.4,
                ease: "power4.inOut",
                delay: (i % 2) * 0.15,
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  once: true,
                },
              }
            );

            const img = inner.querySelector<HTMLElement>("img");
            if (img) {
              gsap.fromTo(
                img,
                { scale: 1.25, filter: "brightness(0.6)" },
                {
                  scale: 1.0,
                  filter: "brightness(1.0)",
                  duration: 1.8,
                  ease: "power3.out",
                  delay: (i % 2) * 0.15,
                  scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    once: true,
                  },
                }
              );
            }
          });
        }
      }

      // Phase 3: Parallax background text layer
      if (!prefersReduced) {
        gsap.to(parallaxBgRef.current, {
          yPercent: -40,
          ease: "none",
          scrollTrigger: {
            trigger: revealRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }

      // Stats row reveal
      if (!prefersReduced) {
        const statItems = statsRowRef.current?.querySelectorAll<HTMLElement>("[data-stat]");
        if (statItems?.length) {
          gsap.fromTo(
            statItems,
            { opacity: 0, y: 40, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.0,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: {
                trigger: statsRowRef.current,
                start: "top 88%",
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

  return (
    <div ref={wrapperRef} className="relative select-none bg-[#0f1011]">
      
      {/* ─── Hero Section ─── */}
      <section
        ref={heroRef}
        id="home"
        aria-label="Lake View Villa — hero"
        className="relative h-[100svh] w-full overflow-hidden"
      >
        <div ref={canvasWrapRef} className="absolute inset-0">
          <Suspense fallback={null}>
            <HeroCanvas scrollProgress={canvasProgress} />
          </Suspense>
          {/* Luxury dark vignettes */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#0f1011]/90 via-[#0f1011]/30 to-[#0f1011]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,165,90,0.06)_0%,transparent_70%)]"
          />
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          {/* Eyebrow */}
          <p
            ref={eyebrowRef}
            className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)] opacity-0"
          >
            Tangalle, Sri Lanka · Lagoon Sanctuary
          </p>

          {/* Heading */}
          <h1
            ref={h1Ref}
            className="font-serif font-black tracking-tight text-white"
            style={{ fontSize: "clamp(3.5rem, 8.5vw, 7.5rem)", lineHeight: 0.95 }}
            aria-label={headline}
          >
            <span className="word-line block opacity-0">
              {line1}
            </span>
            <span className="word-line block text-[var(--color-gold)] italic opacity-0">
              {line2}
            </span>
            <span
              className="word-line mt-6 block font-sans font-medium text-white/70 opacity-0"
              style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.35rem)", letterSpacing: "0.06em" }}
            >
              {subheadline}
            </span>
          </h1>

          {/* CTAs */}
          <div
            ref={ctaRowRef}
            className="mt-12 flex flex-col sm:flex-row items-center gap-5 opacity-0"
          >
            <button
              onClick={handleBook}
              aria-label="Reserve dates"
              className="group relative flex h-14 items-center justify-center overflow-hidden rounded-full border border-[var(--color-gold)]/40 px-10 text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] transition-all duration-500 hover:border-[var(--color-gold)] hover:text-[#0f1011] hover:bg-[var(--color-gold)] hover:scale-102 hover:shadow-[0_12px_30px_rgba(201,165,90,0.25)]"
            >
              <span className="relative z-10 flex items-center gap-1">
                <span>Reserve Your Stay</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </button>
            <Link
              href="/gallery"
              className="inline-flex h-14 items-center justify-center text-xs font-bold uppercase tracking-widest text-white/60 underline underline-offset-8 transition-colors duration-300 hover:text-white hover:decoration-[var(--color-gold)]"
            >
              View Gallery
            </Link>
          </div>

          {/* Scroll Down Hint */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-semibold">
              Scroll Down
            </span>
            <div className="relative h-10 w-[2px] overflow-hidden rounded-full bg-white/10">
              <div
                className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-[var(--color-gold)]"
                style={{ animation: "scrollLine 2.0s cubic-bezier(0.76, 0, 0.24, 1) infinite" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Story & Magazine Reveal ─── */}
      <section
        ref={revealRef}
        id="villa-story"
        aria-labelledby="story-heading"
        className="relative overflow-hidden border-t border-[var(--color-border)]/50 py-24 md:py-36 bg-[var(--color-background)]"
      >
        {/* Parallax Background Text */}
        <div
          ref={parallaxBgRef}
          className="pointer-events-none select-none absolute inset-x-0 top-10 z-0 text-center"
          style={{ willChange: "transform" }}
        >
          <span
            className="block font-serif font-black text-[var(--color-foreground)]/[0.025] leading-none"
            style={{ fontSize: "clamp(8rem, 25vw, 24rem)", letterSpacing: "-0.04em" }}
          >
            PARADISE
          </span>
        </div>

        <div className="relative z-10 lv-container">
          <div ref={storyHeadRef} className="mb-20 max-w-3xl">
            <p className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[var(--color-gold)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
                The Legacy
              </span>
            </p>
            <h2
              id="story-heading"
              className="font-serif font-black leading-[1.05] tracking-tight text-[var(--color-foreground)]"
              style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
            >
              Where the lagoon{" "}
              <span className="italic text-[var(--color-gold)] font-medium">meets</span>
              <br />
              uncompromising luxury.
            </h2>
            <p className="mt-6 max-w-xl text-[var(--color-muted)] leading-relaxed text-base">
              Lake View Villa merges bespoke tropical architecture with the silent, majestic beauty of Tangalle Lagoon. Designed as a deep retreat from friction, it offers total privacy and direct access to pristine Sri Lankan nature.
            </p>
          </div>

          {/* Editorial Magazine Grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {VILLA_CARDS.map((card, i) => (
              <div
                key={card.src}
                data-card
                className={`relative ${card.span} overflow-hidden rounded-2xl group border border-[var(--color-border)]/40 shadow-sm`}
              >
                <div
                  data-card-inner
                  className={`relative overflow-hidden ${card.aspect} bg-[var(--color-surface)]`}
                  style={{ clipPath: "inset(100% 0% 0% 0%)" }}
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-108"
                    sizes={
                      i === 0
                        ? "(max-width: 1024px) 100vw, 66vw"
                        : "(max-width: 640px) 100vw, 33vw"
                    }
                    quality={85}
                  />

                  {/* Scrim Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                  {/* Label Details */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)] mb-1">
                        {card.sub}
                      </p>
                      <h3 className="font-serif text-lg font-bold">
                        {card.label}
                      </h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/20 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div
          ref={statsRowRef}
          className="relative z-10 lv-container mt-28 border-t border-[var(--color-border)]/50 pt-16"
        >
          <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                data-stat
                className="px-4 text-center sm:text-left sm:border-r sm:border-[var(--color-border)]/50 sm:last:border-r-0"
              >
                <div className="flex items-baseline justify-center sm:justify-start gap-1">
                  <p
                    className="font-serif font-black text-[var(--color-foreground)] leading-none"
                    style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                  >
                    {s.value.replace("★", "")}
                  </p>
                  {s.value.includes("★") && <Star className="h-5 w-5 fill-[var(--color-gold)] text-[var(--color-gold)]" />}
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Callout ─── */}
      <section
        aria-label="Reservations and bookings info"
        className="relative overflow-hidden py-32 bg-[#0c0d0e] border-t border-white/5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(201,165,90,0.06) 0%, transparent 60%)"
          }}
        />

        <div className="relative z-10 lv-container text-center">
          <p className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-6 bg-[var(--color-gold)]/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
              Availability
            </span>
            <span className="h-px w-6 bg-[var(--color-gold)]/40" />
          </p>

          <h2
            className="font-serif font-black text-white leading-tight tracking-tight mb-8"
            style={{ fontSize: "clamp(2.5rem, 6.5vw, 5.5rem)" }}
          >
            Your lagoon.
            <br />
            <span className="text-[var(--color-gold)] italic">Your sanctuary.</span>
          </h2>

          <p className="mx-auto max-w-lg text-white/50 text-base leading-relaxed mb-12">
            By booking directly, you bypass third-party OTA service charges and secure immediate, direct channel rates with local priority support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={handleBook}
              aria-label="Connect via WhatsApp"
              className="group relative flex h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] px-10 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-transform duration-300 hover:scale-102 hover:shadow-[0_8px_25px_rgba(201,165,90,0.3)]"
            >
              <span>Connect via WhatsApp</span>
            </button>
            <Link
              href="/stays"
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-[var(--color-gold)] transition-colors duration-300"
            >
              <span>Explore suites</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <p className="mt-12 text-[10px] uppercase tracking-widest text-white/20 font-bold">
            Listing channels: Airbnb · Booking.com
          </p>
        </div>
      </section>

      <style jsx global>{`
        @keyframes scrollLine {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}
