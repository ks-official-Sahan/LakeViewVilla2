"use client";

import { useRef, useMemo } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap";
import { FACILITIES } from "@/data/content";

interface FacilitiesSectionProps {
  cmsData?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items?: any[];
  };
}

// Custom Premium Vector SVGs
const BedroomIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-4.5 w-4.5" aria-hidden="true">
    <path d="M2 19h20M2 15v4M22 15v4M2 11h20M4 11V7a2 2 0 012-2h12a2 2 0 012 2v4" />
    <path d="M6 11V9a1 1 0 011-1h3a1 1 0 011 1v2M13 11V9a1 1 0 011-1h3a1 1 0 011 1v2" className="stroke-accent" />
  </svg>
);

const KitchenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-4.5 w-4.5" aria-hidden="true">
    <path d="M3 14h18M3 18h18M4 14V6a2 2 0 012-2h12a2 2 0 012 2v8" />
    <circle cx="7" cy="9" r="1.5" className="stroke-accent" />
    <circle cx="17" cy="9" r="1.5" className="stroke-accent" />
  </svg>
);

const OutdoorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-4.5 w-4.5" aria-hidden="true">
    <path d="M12 2L3 18h18L12 2z" />
    <path d="M12 8l-6 10h12L12 8z" className="stroke-accent" />
    <path d="M12 18v3" />
  </svg>
);

const ShowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-4.5 w-4.5" aria-hidden="true">
    <path d="M4 4h16v3H4zM7 7v13a2 2 0 002 2h6a2 2 0 002-2V7" />
    <circle cx="12" cy="11" r="1" className="fill-accent" />
    <circle cx="12" cy="15" r="1" className="fill-accent" />
  </svg>
);

const CotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-4.5 w-4.5" aria-hidden="true">
    <path d="M3 5h18v12H3zM3 11h18M7 5v12M17 5v12" />
    <path d="M3 17a2 2 0 002 2h14a2 2 0 002-2" className="stroke-accent" />
  </svg>
);

const BalconyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-4.5 w-4.5" aria-hidden="true">
    <path d="M12 2v2M5.2 5.2l1.4 1.4M18.8 5.2l-1.4 1.4M2 12h20" />
    <path d="M12 8a4 4 0 00-4 4h8a4 4 0 00-4-4z" className="stroke-accent" fill="currentColor" />
  </svg>
);

const FallbackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-4.5 w-4.5" aria-hidden="true">
    <path d="M12 3v18M3 12h18M12 3l4 4M12 21l-4-4" className="stroke-accent" />
  </svg>
);

// Icon mapping based on ID key
const ICON_MAP: Record<string, React.ComponentType> = {
  "bedroom-1": BedroomIcon,
  "bedroom-2": BedroomIcon,
  kitchen: KitchenIcon,
  outdoor: OutdoorIcon,
  "bathroom-1": ShowerIcon,
  "bathroom-2": ShowerIcon,
  cot: CotIcon,
  balcony: BalconyIcon,
};

export default function FacilitiesSection({ cmsData }: FacilitiesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow || "Villa Conveniences";
  const title = cmsData?.title || "Every comfort, considered.";
  const descriptionText =
    cmsData?.description ||
    "Curated amenities designed to deliver a seamless, relaxing stay beside the Tangalle lagoon.";

  // Group facilities into 3 columns for editorial structure
  const categorizedFacilities = useMemo(() => {
    const rawList = Array.isArray(cmsData?.items) && cmsData.items.length > 0
      ? cmsData.items
      : FACILITIES;

    const categories = [
      {
        title: "Suites & Comfort",
        items: [] as any[],
      },
      {
        title: "Living & Dining",
        items: [] as any[],
      },
      {
        title: "Outdoors & Spaces",
        items: [] as any[],
      },
    ];

    rawList.forEach((fac) => {
      const icon = ICON_MAP[fac.id] || FallbackIcon;
      const normalizedItem = { ...fac, icon };

      if (fac.id.includes("bedroom") || fac.id === "cot") {
        categories[0].items.push(normalizedItem);
      } else if (fac.id === "kitchen" || fac.id === "balcony") {
        categories[1].items.push(normalizedItem);
      } else {
        categories[2].items.push(normalizedItem);
      }
    });

    return categories;
  }, [cmsData]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const columns = gridRef.current?.querySelectorAll("[data-category-col]");
      if (!columns?.length) return;

      // Columns fade and slide up staggered
      gsap.fromTo(
        columns,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: "cubic-bezier(0.16, 1, 0.3, 1)",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="facilities"
      aria-labelledby="facilities-heading"
      className="relative overflow-hidden py-24 md:py-32 bg-background border-t border-border/40"
    >
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[35rem]"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 75% 0%, var(--color-gold-muted) 0%, transparent 65%)",
          opacity: 0.03
        }}
      />

      <div className="lv-container relative">
        {/* Title Heading */}
        <div className="mb-20 flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block">
            {eyebrow}
          </span>
          <h2
            id="facilities-heading"
            className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.08]"
          >
            {title}
          </h2>
          <p className="mt-6 max-w-xl font-sans text-sm leading-relaxed text-foreground/70 dark:text-foreground/80">
            {descriptionText}
          </p>
        </div>

        {/* 3-Column Categorized Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
        >
          {categorizedFacilities.map((category, colIdx) => (
            <div
              key={colIdx}
              data-category-col
              className="flex flex-col gap-8"
            >
              {/* Category Title */}
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent border-b border-border/60 pb-4">
                {category.title}
              </h3>

              {/* Items List */}
              <div className="flex flex-col gap-4">
                {category.items.map((fac) => {
                  const Icon = fac.icon;
                  return (
                    <article
                      key={fac.id}
                      className="group p-[1px] rounded-sm bg-gradient-to-b from-foreground/10 to-transparent dark:from-white/5 dark:to-transparent hover:shadow-[0_12px_30px_rgba(11,32,39,0.06)] hover:scale-[1.01] transition-all duration-350"
                    >
                      {/* Inner core card */}
                      <div className="relative w-full h-full rounded-[3px] bg-card p-6 border border-foreground/5 dark:border-white/5 flex gap-5 items-start">
                        {/* Icon Frame */}
                        <div className="flex-shrink-0 h-10 w-10 items-center justify-center rounded-sm border border-accent/20 bg-accent/5 text-accent flex transition-all duration-500 group-hover:bg-accent group-hover:text-background group-hover:scale-105 shadow-sm">
                          <Icon />
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5">
                          <h4 className="font-display text-sm font-bold text-foreground transition-colors duration-300 group-hover:text-accent">
                            {fac.title}
                          </h4>
                          <p className="font-sans text-xs leading-relaxed text-foreground/60 dark:text-foreground/75">
                            {fac.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

