"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { gsap, ScrollTrigger, EASE, DURATION } from "@/lib/gsap";
import { CheckCircle2, Star, Award } from "lucide-react";
import { VALUES_ITEMS } from "@/data/content";
import { CounterReveal } from "@/components/scroll/CounterReveal";

// Custom Premium Vector SVGs matching design style
const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-5 w-5" aria-hidden="true">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3C13 6.8 11.5 6 10 6H4c-1.1 0-2 .9-2 2v8c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" className="stroke-accent" />
    <circle cx="15" cy="17" r="2" className="stroke-accent" />
    <path d="M13 17h-4" />
  </svg>
);

const WavesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-5 w-5" aria-hidden="true">
    <path d="M2 17c3-1.5 6-1.5 9 0s6 1.5 9 0 6-1.5 9 0" />
    <path d="M2 20c3-1.5 6-1.5 9 0s6 1.5 9 0 6-1.5 9 0" className="stroke-accent" />
    <circle cx="12" cy="7" r="3" />
  </svg>
);

const UtensilsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-5 w-5" aria-hidden="true">
    <path d="M3 14h18M3 18h18M4 14V6a2 2 0 012-2h12a2 2 0 012 2v8" />
    <circle cx="7" cy="9" r="1.5" className="stroke-accent" />
    <circle cx="17" cy="9" r="1.5" className="stroke-accent" />
  </svg>
);

const WindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-5 w-5" aria-hidden="true">
    <rect x="2" y="5" width="20" height="11" rx="1" />
    <path d="M6 16v3M18 16v3M2 11h20" />
    <path d="M9 20c.5-1 1.5-1.5 3-1.5s2.5.5 3 1.5" className="stroke-accent" />
  </svg>
);

const TreesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-5 w-5" aria-hidden="true">
    <path d="M12 2L3 18h18L12 2z" />
    <path d="M12 8l-6 10h12L12 8z" className="stroke-accent" />
    <path d="M12 18v3" />
  </svg>
);

const ShowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-5 w-5" aria-hidden="true">
    <path d="M4 4h16v3H4zM7 7v13a2 2 0 002 2h6a2 2 0 002-2V7" />
    <circle cx="12" cy="11" r="1" className="fill-accent" />
    <circle cx="12" cy="15" r="1" className="fill-accent" />
  </svg>
);

const FallbackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-5 w-5" aria-hidden="true">
    <path d="M12 3v18M3 12h18M12 3l4 4M12 21l-4-4" className="stroke-accent" />
  </svg>
);

const iconMap = {
  car: CarIcon,
  waves: WavesIcon,
  utensils: UtensilsIcon,
  wind: WindIcon,
  trees: TreesIcon,
  shower: ShowerIcon,
} as const;

const NEARBY = [
  "Goyambokka Beach — less than 1 km",
  "Hummanaya Blow Hole — 10 km",
  "Free WiFi · Air Conditioning · Free Parking",
];

export function ValuesSection({ cmsData }: { cmsData?: { eyebrow?: string; title?: string; sublines?: any; items?: any[] } }) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const eyebrow = cmsData?.eyebrow || "Our Values";
  const title = cmsData?.title || "The value we provide to you";
  
  const sublines = useMemo(() => {
    if (!cmsData?.sublines) return NEARBY;
    if (Array.isArray(cmsData.sublines)) return cmsData.sublines;
    if (typeof cmsData.sublines === "string") {
      try {
        const parsed = JSON.parse(cmsData.sublines);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return [cmsData.sublines];
    }
    return NEARBY;
  }, [cmsData]);

  const itemsList = useMemo(() => {
    return Array.isArray(cmsData?.items) && cmsData.items.length > 0
      ? cmsData.items
      : VALUES_ITEMS;
  }, [cmsData]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1, 
          x: 0, 
          duration: 1.2, 
          ease: "cubic-bezier(0.16, 1, 0.3, 1)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        }
      );

      gsap.fromTo(
        copyRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          ease: "cubic-bezier(0.16, 1, 0.3, 1)", 
          delay: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        }
      );

      const items = listRef.current?.querySelectorAll<HTMLElement>("[data-value-item]");
      if (items?.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 30 },
          {
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.08, 
            ease: "cubic-bezier(0.16, 1, 0.3, 1)",
            scrollTrigger: { trigger: listRef.current, start: "top 82%", once: true },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="values-heading"
      className="relative overflow-hidden py-24 md:py-32 bg-background border-t border-border/40"
    >
      {/* Background Soft Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(55% 40% at 0% 50%, var(--color-gold-muted) 0%, transparent 65%)",
          opacity: 0.04
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        {/* Overlapping layout split to avoid boring 50/50 screen split */}
        <div className="grid items-start gap-16 lg:grid-cols-12 lg:gap-20">
          
          {/* Left Column Image (Wider span, overlapping elements) */}
          <div ref={imageRef} className="relative lg:col-span-5">
            <div className="relative overflow-hidden rounded-sm border border-border/60 shadow-2xl">
              {/* Arch structure image crop - sharp luxury corners */}
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src="/villa/optimized/with_guests_02.webp"
                  alt="Guests relaxing in the gardens"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/70 to-transparent pointer-events-none"
                />
              </div>
            </div>

            {/* Glowing gold rating counter pill - overlapping image */}
            <div className="absolute -right-6 -top-6 flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-sm border border-border/60 bg-card text-foreground shadow-2xl md:h-28 md:w-28">
              <div className="flex items-center gap-0.5">
                <CounterReveal
                  value={4.9}
                  format={(n) => n.toFixed(1)}
                  duration={1.5}
                  className="font-display text-2xl font-black leading-none text-foreground"
                />
                <Star className="h-4.5 w-4.5 fill-accent text-accent" />
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-foreground/70">
                Rating
              </span>
            </div>

            {/* Floating verification badge - overlapping bottom */}
            <div className="absolute -bottom-6 left-8 flex items-center gap-4 border border-border/60 bg-card px-5 py-4 shadow-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-accent/20 bg-accent/5 text-accent shadow-sm">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <p className="font-display font-bold text-foreground">Superhost Status</p>
                <p className="text-foreground/60 font-sans font-medium">99% Positive Feedback</p>
              </div>
            </div>
          </div>

          {/* Right Column copy (Spans larger width segment) */}
          <div ref={copyRef} className="lg:col-span-7 mt-10 lg:mt-0">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block">
              {eyebrow}
            </span>
            
            <h2
              id="values-heading"
              className="relative font-display text-4xl md:text-5xl font-black leading-[1.08] tracking-tight text-foreground"
            >
              {title}
            </h2>

            {/* Sublines checkmarks */}
            <ul className="mt-8 space-y-3.5 border-t border-border/40 pt-6">
              {sublines.map((item: any, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm text-foreground/75 dark:text-foreground/85 font-sans font-medium">
                  <CheckCircle2 className="h-4.5 w-4.5 text-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Value list detail grids with custom SVG markers */}
            <ul ref={listRef} className="mt-12 space-y-4">
              {itemsList.map((item: any) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap] ?? FallbackIcon;
                return (
                  <li
                    key={item.id}
                    data-value-item
                    className="group flex items-start gap-6 rounded-sm border border-foreground/5 dark:border-white/5 bg-card p-6 md:p-8 hover:shadow-[0_15px_40px_rgba(11,32,39,0.06)] hover:border-accent/20 transition-all duration-350"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-accent/20 bg-accent/5 text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-background shadow-sm">
                      <Icon />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground transition-colors duration-300 group-hover:text-accent tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/70 dark:text-foreground/80">{item.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

