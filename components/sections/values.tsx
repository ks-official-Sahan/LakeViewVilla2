"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { gsap, ScrollTrigger, EASE, DURATION } from "@/lib/gsap";
import {
  Car, Waves, Utensils, Wind, Trees, ShowerHead, CheckCircle2, Star, ShieldAlert, Award
} from "lucide-react";
import { VALUES_ITEMS } from "@/data/content";
import { CounterReveal } from "@/components/scroll/CounterReveal";

const iconMap = {
  car: Car,
  waves: Waves,
  utensils: Utensils,
  wind: Wind,
  trees: Trees,
  shower: ShowerHead,
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
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0, duration: DURATION.reveal, ease: EASE.premium,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        }
      );

      gsap.fromTo(
        copyRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.premium, delay: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", once: true },
        }
      );

      const items = listRef.current?.querySelectorAll<HTMLElement>("[data-value-item]");
      if (items?.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: EASE.premium,
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
      className="relative overflow-hidden py-24 md:py-36 bg-[var(--color-background)] border-t border-[var(--color-border)]/50"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 40% at 0% 50%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          
          {/* Left Column Image with floating badges */}
          <div ref={imageRef} className="relative">
            <div className="relative overflow-hidden rounded-[3rem] border border-[var(--color-border)]/50 shadow-2xl">
              {/* Arch structure image crop */}
              <div className="relative aspect-[4/5] w-full [clip-path:ellipse(90%_100%_at_50%_100%)]">
                <Image
                  src="/villa/optimized/with_guests_02.webp"
                  alt="Guests relaxing in the gardens"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent"
                />
              </div>
            </div>

            {/* Glowing gold rating counter pill */}
            <div className="absolute -right-4 -top-4 flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-4 border-[var(--color-surface)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-gold)] text-white shadow-2xl md:h-28 md:w-28">
              <div className="flex items-center gap-0.5">
                <CounterReveal
                  value={4.9}
                  format={(n) => n.toFixed(1)}
                  duration={1.5}
                  className="font-serif text-xl font-black leading-none text-white md:text-2xl"
                />
                <Star className="h-4.5 w-4.5 fill-white text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                Rating
              </span>
            </div>

            {/* Floating verification badge */}
            <div className="absolute -bottom-5 left-8 flex items-center gap-3.5 rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/90 px-5 py-4 shadow-xl backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-[var(--color-gold)] shadow-md">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[var(--color-foreground)]">Superhost Status</p>
                <p className="text-[var(--color-muted)] font-medium">99% Positive Feedback</p>
              </div>
            </div>
          </div>

          {/* Right Column copy */}
          <div ref={copyRef}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
              {eyebrow}
            </p>
            <h2
              id="values-heading"
              className="relative font-serif text-[clamp(2.5rem,5vw,3.75rem)] font-black leading-tight tracking-tight text-[var(--color-foreground)]"
            >
              {title}
            </h2>

            {/* Sublines checkmarks */}
            <ul className="mt-8 space-y-3.5">
              {sublines.map((item: any, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[var(--color-muted)] font-medium">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[var(--color-gold)] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Value list detail grids */}
            <ul ref={listRef} className="mt-12 space-y-4">
              {itemsList.map((item: any) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap] ?? Car;
                return (
                  <li
                    key={item.id}
                    data-value-item
                    className="group flex items-start gap-5 rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-6 transition-all duration-500 hover:border-[var(--color-gold)]/40 hover:shadow-[0_12px_32px_rgba(201,165,90,0.08)]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20 transition-colors duration-500 group-hover:bg-[var(--color-gold)] group-hover:text-white group-hover:border-transparent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[var(--color-foreground)] transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{item.body}</p>
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
