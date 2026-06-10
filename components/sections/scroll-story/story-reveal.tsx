"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP, EASE } from "@/lib/gsap";
import { Star, ArrowRight } from "lucide-react";

const STATS = [
  { value: "4.9", label: "Guest rating", star: true },
  { value: "100%", label: "Privacy" },
  { value: "2 min", label: "To beach" },
  { value: "24/7", label: "On-call support" },
];

export function StoryReveal() {
  const revealRef = useRef<HTMLDivElement>(null);
  const storyHeadRef = useRef<HTMLDivElement>(null);
  const storyImageRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const statsRowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      // Story heading reveal
      if (storyHeadRef.current) {
        gsap.fromTo(
          storyHeadRef.current,
          { opacity: 0, y: 60, filter: "blur(10px)" },
          {
            opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, ease: "expo.out",
            scrollTrigger: { trigger: storyHeadRef.current, start: "top 85%", once: true },
          }
        );
      }

      // Image clip-path reveal
      const imgInner = storyImageRef.current?.querySelector<HTMLElement>("[data-story-img]");
      if (imgInner) {
        gsap.fromTo(
          imgInner,
          { clipPath: "inset(100% 0% 0% 0%)", scale: 1.15, filter: "brightness(0.5)" },
          {
            clipPath: "inset(0% 0% 0% 0%)", scale: 1.0, filter: "brightness(1)",
            duration: 1.6, ease: "power4.out",
            scrollTrigger: { trigger: storyImageRef.current, start: "top 85%", once: true },
          }
        );

        // Image parallax
        gsap.fromTo(
          imgInner,
          { yPercent: -10 },
          {
            yPercent: 10, ease: "none",
            scrollTrigger: {
              trigger: storyImageRef.current, start: "top bottom", end: "bottom top", scrub: true,
            },
          }
        );
      }

      // Parallax background text
      if (parallaxBgRef.current) {
        gsap.to(parallaxBgRef.current, {
          yPercent: -40, ease: "none",
          scrollTrigger: {
            trigger: revealRef.current, start: "top bottom", end: "bottom top", scrub: 1.5,
          },
        });
      }

      // Stats row reveal
      const statItems = statsRowRef.current?.querySelectorAll<HTMLElement>("[data-stat]");
      if (statItems?.length) {
        gsap.fromTo(
          statItems,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1, duration: 1.0, stagger: 0.12, ease: "power3.out",
            scrollTrigger: { trigger: statsRowRef.current, start: "top 88%", once: true },
          }
        );
      }
    },
    { scope: revealRef }
  );

  return (
    <div ref={revealRef}>
      <section
        id="villa-story"
        aria-labelledby="story-heading"
        className="relative overflow-hidden py-24 md:py-40 bg-[var(--color-background)]"
      >
        {/* Parallax Background Text */}
        <div
          ref={parallaxBgRef}
          className="pointer-events-none select-none absolute inset-x-0 top-10 z-0 text-center"
          style={{ willChange: "transform" }}
        >
          <span
            className="block font-[var(--font-serif)] font-black text-[var(--color-foreground)]/[0.025] leading-none"
            style={{ fontSize: "clamp(8rem, 25vw, 24rem)", letterSpacing: "-0.04em" }}
          >
            PARADISE
          </span>
        </div>

        <div className="relative z-10 lv-container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
            {/* Left: Typography Block */}
            <div ref={storyHeadRef} className="lg:w-1/2">
              <p className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-[var(--color-gold)]" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
                  The Legacy
                </span>
              </p>
              <h2
                id="story-heading"
                className="font-[var(--font-serif)] font-black leading-[1.05] tracking-tight text-[var(--color-foreground)] mb-8"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                Where the lagoon{" "}
                <span className="italic text-[var(--color-gold)] font-medium">meets</span>
                <br />
                uncompromising luxury.
              </h2>
              <div className="space-y-6 text-[var(--color-muted)] text-base md:text-lg leading-relaxed">
                <p>
                  Lake View Villa merges bespoke tropical architecture with the silent, majestic beauty of Tangalle Lagoon. Designed as a deep retreat from friction, it offers total privacy and direct access to pristine Sri Lankan nature.
                </p>
                <p>
                  Every detail, from the curated interiors to the private gardens, is engineered to erase stress and deliver serenity—from the moment you arrive until the moment you reluctantly depart.
                </p>
              </div>

              <div className="mt-12 flex">
                <Link
                  href="/stays"
                  className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] transition-colors hover:text-[var(--color-gold)]"
                >
                  <span className="border-b border-[var(--color-gold)]/30 group-hover:border-[var(--color-gold)] pb-1 transition-colors">
                    Discover Our Suites
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[var(--color-gold)]" />
                </Link>
              </div>
            </div>

            {/* Right: Signature Image */}
            <div className="w-full lg:w-1/2 flex justify-end">
              <div ref={storyImageRef} className="relative w-full max-w-[600px] aspect-[3/4] rounded-[2rem] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.15)] border border-[var(--color-border)]/50">
                <div className="absolute inset-0 bg-[var(--color-surface)]">
                  <div data-story-img className="relative w-full h-[120%] -top-[10%]">
                    <Image
                      src="/villa/optimized/drone_view_villa.webp"
                      alt="Aerial view of Lake View Villa and Tangalle lagoon"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={90}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f10]/80 via-transparent to-transparent mix-blend-multiply" />

                  {/* Decorative corner accent */}
                  <div className="absolute bottom-8 left-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                      <Star className="h-5 w-5 text-[var(--color-gold)] fill-[var(--color-gold)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div
          ref={statsRowRef}
          className="relative z-10 lv-container mt-24 border-t border-[var(--color-border)]/50 pt-16"
        >
          <div className="grid grid-cols-2 gap-y-12 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border)]/50">
            {STATS.map((s) => (
              <div
                key={s.label}
                data-stat
                className="flex flex-col items-center justify-center px-4 py-4 sm:py-0 text-center"
              >
                <div className="flex items-baseline gap-1">
                  <p
                    className="font-[var(--font-serif)] font-black text-[var(--color-foreground)] leading-none"
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                  >
                    {s.value}
                  </p>
                  {s.star && <Star className="h-5 w-5 fill-[var(--color-gold)] text-[var(--color-gold)]" />}
                </div>
                <p className="mt-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
