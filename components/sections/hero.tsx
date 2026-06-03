"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP, EASE } from "@/lib/gsap";
import { Phone, ChevronDown } from "lucide-react";
import { HERO_CONTENT, SITE_CONFIG } from "@/data/content";
import { buildWhatsAppUrl } from "@/lib/utils";
import { trackContact } from "@/lib/analytics";
import { SplitTextReveal } from "@/components/scroll/SplitTextReveal";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDAAQFBhESIRMxQWH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8Atu0NQZjIyW8sMUkUbAAqBsR+1nGoLlri/lkJ9NVSlKpuSxi5DYz/2Q==";

type Props = {
  nextSectionId: string;
  heroImages?: { src: string; alt?: string }[];
  heroText?: { headline?: string; subheadline?: string; ctaLabel?: string; ctaHref?: string };
};

export function PinnedHero({ nextSectionId, heroImages, heroText }: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const tealWashRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLButtonElement>(null);
  const goldLineRef = useRef<SVGPathElement>(null);

  const headline = heroText?.headline || HERO_CONTENT.title;
  const tagline = heroText?.subheadline || HERO_CONTENT.tagline;
  const ctaLabel = heroText?.ctaLabel || "View Gallery";
  const ctaHref = heroText?.ctaHref || "/gallery";

  const titleLines = headline.split("\n");
  const line1Words = (titleLines[0] || "").split(" ").filter(Boolean);
  const line2Words = (titleLines[1] || "").split(" ").filter(Boolean);

  const bgImg = heroImages?.[0]?.src || "/villa/optimized/villa_img_02.webp";
  const bgAlt = heroImages?.[0]?.alt || "Lake View Villa Tangalle — aerial panorama over Rekawa lake";

  const whatsappUrl = buildWhatsAppUrl(
    SITE_CONFIG.whatsappNumber,
    "Hi! I'm interested in booking Lake View Villa Tangalle. Could you please share availability and rates?"
  );

  const handleWhatsApp = () => {
    trackContact("whatsapp", whatsappUrl, "Chat on WhatsApp");
    setTimeout(() => window.open(whatsappUrl, "_blank", "noopener,noreferrer"), 80);
  };

  const handleScrollDown = () => {
    const el = document.getElementById(nextSectionId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Cinematic entrance & scroll pin sequence (PUBLIC-03) ────────────────
  useGSAP(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const mm = gsap.matchMedia();

    // Desktop: Pin and scrub scroll timeline
    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      const words = containerRef.current?.querySelectorAll(".word-span") || [];

      // 0–25%: Staggered clip reveal of title words
      tl.fromTo(
        words,
        { clipPath: "inset(0 100% 0 0)", opacity: 0 },
        { clipPath: "inset(0 0% 0 0)", opacity: 1, stagger: 0.06, ease: "power2.out", duration: 1 },
        0
      );

      // 25–50%: Parallax background scale + scrim opacity drop
      tl.to(bgRef.current, { scale: 1.08, ease: "none", duration: 1 }, 0.25);
      tl.to(scrimRef.current, { opacity: 0.3, ease: "none", duration: 1 }, 0.25);

      // 50–75%: Gold accent line animation + CTA float up
      if (goldLineRef.current) {
        tl.fromTo(
          goldLineRef.current,
          { strokeDasharray: 200, strokeDashoffset: 200 },
          { strokeDashoffset: 0, ease: "power3.out", duration: 1 },
          0.5
        );
      }
      tl.fromTo(
        ctasRef.current,
        { y: 30, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, ease: "power3.out", duration: 1 },
        0.5
      );

      // Fade out scroll hint
      tl.to(scrollHintRef.current, { opacity: 0, duration: 0.5 }, 0.1);
    });

    // Mobile: Simple entrance animation, no pinning or scrubbing
    mm.add("(max-width: 767px)", () => {
      const tl = gsap.timeline({ defaults: { ease: EASE.premium } });
      const words = containerRef.current?.querySelectorAll(".word-span") || [];

      tl.fromTo(
        bgRef.current,
        { scale: 1.12, opacity: 0 },
        { scale: 1.04, opacity: 1, duration: 1.6 },
        0
      );
      tl.fromTo(
        words,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.8 },
        0.4
      );
      if (goldLineRef.current) {
        tl.fromTo(
          goldLineRef.current,
          { strokeDasharray: 200, strokeDashoffset: 200 },
          { strokeDashoffset: 0, duration: 0.6 },
          0.8
        );
      }
      tl.fromTo(
        ctasRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.9
      );
      tl.fromTo(
        scrollHintRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4 },
        1.3
      );
    });

    // Floating bob for scroll hint
    gsap.to(scrollHintRef.current, {
      y: 8,
      duration: 1.4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2.0,
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      id="home"
      aria-label="Lake View Villa — hero section"
      className="relative h-[100svh] overflow-hidden"
    >
      {/* ── Background image with parallax ─────────────────────── */}
      <div
        ref={bgRef}
        className="absolute inset-0 -z-10 origin-center will-change-transform"
      >
        <Image
          src={bgImg}
          alt={bgAlt}
          fill
          sizes="100vw"
          priority
          placeholder="blur"
          blurDataURL={BLUR}
          quality={85}
          className="object-cover"
          draggable={false}
        />
      </div>

      {/* ── Multi-layer cinematic scrim ─────────────────────────── */}
      <div
        ref={scrimRef}
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,12,18,.75) 0%, rgba(4,12,18,.40) 30%, rgba(4,12,18,.18) 60%, rgba(4,12,18,.55) 100%)",
        }}
      />
      {/* Layer 2 — teal wash */}
      <div
        ref={tealWashRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 opacity-[0.35] will-change-opacity"
        style={{
          background:
            "linear-gradient(to top, rgba(0,178,180,.22), transparent)",
        }}
      />

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex h-full min-h-0 flex-col text-white">
        <div
          aria-hidden
          className="shrink-0"
          style={{
            height:
              "calc(var(--header-h) + env(safe-area-inset-top, 0px) + clamp(0.75rem, 2vh, 1.35rem))",
          }}
        />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-[clamp(1rem,4vw,1.75rem)] pb-[clamp(5rem,12vh,7rem)] text-center">
          <div
            ref={heroContentRef}
            className="mx-auto w-full max-w-[min(100%,64rem)] will-change-[transform,opacity,filter]"
          >
            {/* Eyebrow label */}
            <p
              className="mx-auto mb-[clamp(0.5rem,1.5vmin,0.85rem)] flex w-fit max-w-[min(100%,calc(100vw-2rem))] flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-semibold uppercase tracking-[0.14em] text-white/75 backdrop-blur-sm sm:px-3 sm:tracking-[0.18em]"
              style={{ fontSize: "var(--fluid-hero-eyebrow)" }}
            >
              <span className="size-1 shrink-0 rounded-full bg-[#22d3ee] animate-pulse sm:size-1.5" />
              Tangalle · Sri Lanka
            </p>

            {/* Main heading — split dynamically into spans for clip reveal */}
            <div>
              <h1 className="font-[var(--font-display)] font-black leading-[1.06] tracking-tight sm:leading-[1.03]">
                <span
                  ref={useRef<HTMLSpanElement>(null)}
                  className="block text-white"
                  style={{
                    fontSize: "var(--fluid-hero-title)",
                    textShadow: "0 4px 32px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.8)",
                  }}
                >
                  {line1Words.map((word, i) => (
                    <span key={`w1-${i}`} className="inline-block word-span clip-reveal">
                      {word}
                      {i < line1Words.length - 1 && "\u00A0"}
                    </span>
                  ))}
                </span>
                {line2Words.length > 0 && (
                  <span
                    ref={useRef<HTMLSpanElement>(null)}
                    className="block bg-gradient-to-r from-[#7ee8fa] via-[#22d3ee] to-[#34d399] bg-clip-text text-transparent"
                    style={{ fontSize: "var(--fluid-hero-title)" }}
                  >
                    {line2Words.map((word, i) => (
                      <span key={`w2-${i}`} className="inline-block word-span clip-reveal">
                        {word}
                        {i < line2Words.length - 1 && "\u00A0"}
                      </span>
                    ))}
                  </span>
                )}
              </h1>
            </div>

            {/* Luxury gold accent line */}
            <div className="mx-auto my-5 h-4 w-28 relative">
              <svg className="absolute inset-0 w-full h-full text-[var(--color-gold)]" viewBox="0 0 100 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  ref={goldLineRef}
                  d="M0 6C25 6 25 1 50 1C75 1 75 11 100 11"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Subtitle Tagline */}
            <SplitTextReveal
              text={tagline}
              as="p"
              variant="words"
              intensity="subtle"
              start="top 78%"
              className="mx-auto mt-[clamp(0.75rem,2.5vmin,1.35rem)] max-w-[min(62ch,calc(100vw-2rem))] font-medium leading-relaxed text-white/80"
              style={{
                textShadow: "0 2px 14px rgba(0,0,0,.5)",
                fontSize: "var(--fluid-hero-body)",
              }}
            />

            {/* CTAs */}
            <div
              ref={ctasRef}
              className="mx-auto mt-[clamp(1.25rem,3.5vmin,2rem)] flex w-full max-w-[min(40rem,100%)] flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            >
              <Link
                href={ctaHref}
                transitionTypes={["spa-page"]}
                aria-label="Navigate to destination"
                className="group relative inline-flex h-11 w-full max-w-[min(100%,17rem)] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-white/12 px-5 py-2 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/50 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 sm:h-12 sm:w-52 sm:max-w-none sm:shrink-0 sm:px-6 sm:py-2.5"
                style={{ fontSize: "var(--fluid-cta-text)" }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-full top-0 h-full w-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{ animation: "none" }}
                />
                {ctaLabel}
              </Link>

              <button
                onClick={handleWhatsApp}
                aria-label="Contact us via WhatsApp to book"
                className="group inline-flex h-11 w-full max-w-[min(100%,20rem)] cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] px-5 py-2 font-semibold text-white shadow-lg shadow-[#0ea5e9]/30 transition-all duration-300 hover:shadow-[#0ea5e9]/50 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22d3ee]/60 sm:h-12 sm:w-60 sm:max-w-none sm:shrink-0 sm:px-6 sm:py-2.5"
                style={{ fontSize: "var(--fluid-cta-text)" }}
              >
                <Phone className="size-4 shrink-0 sm:size-[1.05rem]" />
                {HERO_CONTENT.ctas[1]}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <button
          ref={scrollHintRef}
          type="button"
          onClick={handleScrollDown}
          aria-label="Scroll down to explore"
          className="pointer-events-auto absolute bottom-[max(env(safe-area-inset-bottom,1rem),1.25rem)] left-1/2 z-20 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-[clamp(0.25rem,1vw,0.45rem)] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="font-medium uppercase tracking-[0.14em] sm:tracking-widest [font-size:clamp(0.5625rem,calc(0.48rem+0.35vw),0.6875rem)]">
            Scroll to explore
          </span>
          <span className="relative h-8 w-px overflow-hidden rounded-full bg-white/20">
            <span
              aria-hidden
              className="absolute top-0 h-1/2 w-full rounded-full bg-white/80"
              style={{ animation: "scrollLine 1.6s ease-in-out infinite" }}
            />
          </span>
          <ChevronDown className="h-[clamp(0.85rem,2vw,1rem)] w-[clamp(0.85rem,2vw,1rem)] opacity-60" />
        </button>
      </div>
    </section>
  );
}
