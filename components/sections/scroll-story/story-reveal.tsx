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

/**
 * StoryReveal — Editorial section below hero
 *
 * Split layout: left text, right image.
 * Scroll-driven reveal with clip-path + parallax.
 * Stats strip with staggered entrance.
 */
export function StoryReveal() {
  const revealRef = useRef<HTMLDivElement>(null);
  const storyHeadRef = useRef<HTMLDivElement>(null);
  const storyImageRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const statsRowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      // Story heading reveal
      if (storyHeadRef.current) {
        gsap.fromTo(
          storyHeadRef.current,
          { opacity: 0, y: 50, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: {
              trigger: storyHeadRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // Image clip-path reveal
      const imgInner =
        storyImageRef.current?.querySelector<HTMLElement>("[data-story-img]");
      if (imgInner) {
        gsap.fromTo(
          imgInner,
          {
            clipPath: "inset(100% 0% 0% 0%)",
            scale: 1.12,
            filter: "brightness(0.6)",
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1.0,
            filter: "brightness(1)",
            duration: 1.4,
            ease: "power4.out",
            scrollTrigger: {
              trigger: storyImageRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );

        // Image parallax
        gsap.fromTo(
          imgInner,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: storyImageRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Parallax background text
      if (parallaxBgRef.current) {
        gsap.to(parallaxBgRef.current, {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: revealRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      // Stats row reveal
      const statItems =
        statsRowRef.current?.querySelectorAll<HTMLElement>("[data-stat]");
      if (statItems?.length) {
        gsap.fromTo(
          statItems,
          { opacity: 0, y: 32, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRowRef.current,
              start: "top 88%",
              once: true,
            },
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
        className="relative overflow-hidden py-20 md:py-32 bg-[var(--color-background)]"
      >
        {/* Parallax Background Text */}
        <div
          ref={parallaxBgRef}
          className="pointer-events-none select-none absolute inset-x-0 top-8 z-0 text-center"
          style={{ willChange: "transform" }}
        >
          <span
            className="block font-[var(--font-display)] font-black text-[var(--color-foreground)]/[0.02] leading-none"
            style={{
              fontSize: "clamp(6rem, 20vw, 20rem)",
              letterSpacing: "-0.04em",
            }}
          >
            PARADISE
          </span>
        </div>

        <div className="relative z-10 lv-container">
          <div className="flex flex-col lg:flex-center gap-12 lg:gap-20">
            {/* Left: Typography Block */}
            <div ref={storyHeadRef} className="lg:w-1/2">
              <p className="flex items-center gap-3 mb-5">
                <span className="h-px w-6 bg-[var(--color-gold)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">
                  The Legacy
                </span>
              </p>
              <h2
                id="story-heading"
                className="font-[var(--font-display)] font-black leading-[1.05] tracking-tight text-[var(--color-foreground)] mb-6"
                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
              >
                Where the lagoon{" "}
                <span className="italic text-[var(--color-gold)] font-[var(--font-serif)]">
                  meets
                </span>
                <br />
                uncompromising luxury.
              </h2>
              <div className="space-y-5 text-[var(--color-muted)] text-base leading-relaxed max-w-[56ch]">
                <p>
                  Lake View Villa merges bespoke tropical architecture with the
                  silent, majestic beauty of Tangalle Lagoon. Designed as a deep
                  retreat from friction, it offers total privacy and direct access
                  to pristine Sri Lankan nature.
                </p>
                <p>
                  Every detail, from the curated interiors to the private gardens,
                  is engineered to erase stress and deliver serenity — from the
                  moment you arrive until the moment you reluctantly depart.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/stays"
                  className="group inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-foreground)] transition-colors hover:text-[var(--color-gold)]"
                >
                  <span className="border-b border-[var(--color-gold)]/25 group-hover:border-[var(--color-gold)] pb-0.5 transition-colors">
                    Discover Our Suites
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-[var(--color-gold)]" />
                </Link>
              </div>
            </div>

            {/* Right: Signature Image */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div
                ref={storyImageRef}
                className="relative w-full max-w-[560px] aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-[var(--color-border)]/40"
              >
                <div className="absolute inset-0 bg-[var(--color-surface)]">
                  <div
                    data-story-img
                    className="relative w-full h-[120%] -top-[10%]"
                  >
                    <Image
                      src="/villa/optimized/drone_view_villa.webp"
                      alt="Aerial view of Lake View Villa and Tangalle lagoon"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={90}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f10]/70 via-transparent to-transparent mix-blend-multiply" />

                  {/* Decorative corner accent */}
                  <div className="absolute bottom-6 left-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 backdrop-blur-md">
                      <Star className="h-4 w-4 text-[var(--color-gold)] fill-[var(--color-gold)]" />
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
          className="relative z-10 lv-container mt-20 border-t border-[var(--color-border)]/40 pt-12"
        >
          <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border)]/40">
            {STATS.map((s) => (
              <div
                key={s.label}
                data-stat
                className="flex flex-col items-center justify-center px-4 py-3 sm:py-0 text-center"
              >
                <div className="flex items-baseline gap-1">
                  <p
                    className="font-[var(--font-display)] font-black text-[var(--color-foreground)] leading-none"
                    style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                  >
                    {s.value}
                  </p>
                  {s.star && (
                    <Star className="h-4 w-4 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                  )}
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
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
