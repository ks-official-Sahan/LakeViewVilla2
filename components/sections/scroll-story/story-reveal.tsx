"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { Star, ArrowRight } from "lucide-react";

const STATS = [
  { value: "4.9", label: "Guest rating", star: true },
  { value: "100%", label: "Privacy" },
  { value: "2 Min", label: "To Beach" },
  { value: "24/7", label: "Support" },
];

export function StoryReveal() {
  const revealRef = useRef<HTMLDivElement>(null);
  const storyHeadRef = useRef<HTMLDivElement>(null);
  const storyBodyRef = useRef<HTMLDivElement>(null);
  const storyImageRef = useRef<HTMLDivElement>(null);
  const statsRowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      // Left column heading reveal
      if (storyHeadRef.current) {
        gsap.fromTo(
          storyHeadRef.current,
          { opacity: 0, x: -30, filter: "blur(6px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: storyHeadRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      // Right column body reveal
      if (storyBodyRef.current) {
        gsap.fromTo(
          storyBodyRef.current,
          { opacity: 0, x: 30, filter: "blur(6px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: storyBodyRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      // Image split-curtain clip-path reveal
      const imgInner = storyImageRef.current?.querySelector<HTMLElement>("[data-story-img]");
      if (imgInner) {
        gsap.fromTo(
          imgInner,
          {
            clipPath: "inset(0% 50% 0% 50%)",
            scale: 1.15,
            filter: "brightness(0.65)",
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1.0,
            filter: "brightness(1)",
            duration: 1.6,
            ease: "power4.inOut",
            scrollTrigger: {
              trigger: storyImageRef.current,
              start: "top 78%",
              once: true,
            },
          }
        );

        // Parallax scroll on image inside its mask
        gsap.fromTo(
          imgInner,
          { yPercent: -12 },
          {
            yPercent: 12,
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

      // Stats row reveal
      const statItems = statsRowRef.current?.querySelectorAll<HTMLElement>("[data-stat]");
      if (statItems?.length) {
        gsap.fromTo(
          statItems,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRowRef.current,
              start: "top 85%",
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
        className="relative overflow-hidden py-24 md:py-36 bg-[var(--color-background)]"
      >
        <div className="relative z-10 lv-container">
          
          {/* Split Header/Body Layout: Heading Left, Description Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-20">
            
            {/* Left Block: Heading */}
            <div ref={storyHeadRef} className="lg:col-span-6">
              <p className="flex items-center gap-3 mb-5">
                <span className="h-px w-6 bg-[var(--color-gold)]" />
                <span className="text-[10px] font-[var(--font-sans)] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]">
                  The Sanctuary
                </span>
              </p>
              <h2
                id="story-heading"
                className="font-[var(--font-display)] font-bold leading-[1.05] tracking-tight text-foreground"
                style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
              >
                Where the lagoon{" "}
                <span className="italic text-[var(--color-gold)] font-[var(--font-serif)] font-normal">
                  meets
                </span>
                <br />
                uncompromising luxury.
              </h2>
            </div>

            {/* Right Block: Content Body */}
            <div ref={storyBodyRef} className="lg:col-span-6 space-y-6 text-foreground/70 font-[var(--font-sans)] text-base leading-relaxed lg:pt-8">
              <p className="text-wrap-balance">
                Lake View Villa merges bespoke tropical architecture with the silent, majestic beauty of Tangalle Lagoon. Designed as a deep retreat from friction, it offers total privacy and direct access to pristine Sri Lankan nature.
              </p>
              <p className="text-wrap-balance">
                Every detail, from the curated interiors to the private gardens, is engineered to erase stress and deliver serenity — from the moment you arrive until the moment you reluctantly depart.
              </p>
              <div className="pt-4">
                <Link
                  href="/stays"
                  className="group inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:text-[var(--color-gold)]"
                >
                  <span className="border-b border-[var(--color-gold)]/25 group-hover:border-[var(--color-gold)] pb-0.5 transition-colors">
                    Discover Our Suites
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-[var(--color-gold)]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Full-width Panoramic Image with Double Bezel Frame */}
          <div ref={storyImageRef} className="w-full flex justify-center mb-24">
            <div 
              className="w-full max-w-[1120px] aspect-[16/9] md:aspect-[21/9] p-2 rounded-[2.5rem] bg-foreground/[0.02] dark:bg-white/[0.02] border border-foreground/10 dark:border-white/10"
              style={{ viewTransitionName: "story-featured-image" }}
            >
              {/* Inner Core */}
              <div className="relative w-full h-full rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] bg-card border border-foreground/5 dark:border-white/5">
                <div
                  data-story-img
                  className="relative w-full h-[130%] -top-[15%]"
                >
                  <Image
                    src="/villa/optimized/villa_img_02.webp"
                    alt="Scenic view of Lake View Villa and Tangalle lagoon"
                    fill
                    className="object-cover"
                    sizes="90vw"
                    quality={95}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Stats Strip */}
          <div
            ref={statsRowRef}
            className="relative z-10 lv-container border-t border-foreground/10 pt-16"
          >
            <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-foreground/10">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  data-stat
                  className="flex flex-col items-center justify-center px-4 py-3 sm:py-0 text-center first:border-t-0"
                >
                  <div className="flex items-baseline gap-1">
                    <p
                      className="font-[var(--font-display)] font-bold text-foreground leading-none"
                      style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                    >
                      {s.value}
                    </p>
                    {s.star && (
                      <Star className="h-4 w-4 fill-[var(--color-gold)] text-[var(--color-gold)]" />
                    )}
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/45">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
