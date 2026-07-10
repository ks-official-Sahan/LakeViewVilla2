"use client";

import { useRef, useMemo } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { HIGHLIGHTS as RAW_HIGHLIGHTS } from "@/data/content";
import { SectionHeading } from "@/components/ui/section-heading";

type Item = string | { title?: string; label?: string; description?: string; icon?: string };

const DEFAULT_DESCRIPTIONS = [
  "Sunrise over the lagoon, framed from every bedroom window.",
  "Climate-controlled suites with hotel-grade linens and blackout drapes.",
  "Lightning-fast connectivity — 50+ Mbps, wherever you roam on the estate.",
  "Private chef service on request — Sri Lankan feasts or continental.",
  "Airport transfers, tour curation, and 24/7 on-call support.",
  "Secure, gated on-site parking at no additional cost.",
  "Beaches, markets, and hidden coves within minutes of the gate.",
  "Daily housekeeping ensures the villa remains pristine throughout.",
  "Paddle, swim, or drift — the lagoon is entirely yours.",
  "Walled gardens and private grounds for complete seclusion.",
];

// Bespoke Luxury Vector Icons as inline SVG components
const LakeViewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-6 w-6" aria-hidden="true">
    <path d="M2 18c3-1.5 6-1.5 9 0s6 1.5 9 0 6-1.5 9 0" />
    <path d="M2 21c3-1.5 6-1.5 9 0s6 1.5 9 0" />
    <circle cx="12" cy="8" r="4" className="stroke-gold" />
    <path d="M12 2v2M5.5 4.5l1.2 1.2M18.5 4.5l-1.2 1.2" />
  </svg>
);

const ACIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-6 w-6" aria-hidden="true">
    <rect x="2" y="5" width="20" height="11" rx="1" />
    <path d="M6 16v3M18 16v3M2 11h20M7 8h10" />
    <path d="M9 20c.5-1 1.5-1.5 3-1.5s2.5.5 3 1.5" className="stroke-gold" />
  </svg>
);

const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-6 w-6" aria-hidden="true">
    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    <path d="M8.5 15.5a5 5 0 017 0" className="stroke-gold" />
    <path d="M5 12a10 10 0 0114 0" />
    <path d="M1.5 8.5a15 15 0 0121 0" />
  </svg>
);

const ChefIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-6 w-6" aria-hidden="true">
    <path d="M6 17h12M5 13h14M7 13V8a5 5 0 0110 0v5M9 21h6v-4H9v4z" />
    <circle cx="12" cy="3" r="1" className="stroke-gold" fill="currentColor" />
  </svg>
);

const TransferIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-6 w-6" aria-hidden="true">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3C13 6.8 11.5 6 10 6H4c-1.1 0-2 .9-2 2v8c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" className="stroke-gold" />
    <circle cx="15" cy="17" r="2" className="stroke-gold" />
    <path d="M13 17h-4" />
  </svg>
);

const ParkingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-6 w-6" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="1.5" />
    <path d="M9 16V8h4.5a2.5 2.5 0 010 5H9" className="stroke-gold" />
  </svg>
);

const CUSTOM_ICONS = [
  LakeViewIcon,
  ACIcon,
  WifiIcon,
  ChefIcon,
  TransferIcon,
  ParkingIcon,
];

function normalize(items: Item[]) {
  return items.map((it, i) => {
    if (typeof it === "string") {
      return {
        title: it,
        description: DEFAULT_DESCRIPTIONS[i % DEFAULT_DESCRIPTIONS.length],
        icon: CUSTOM_ICONS[i % CUSTOM_ICONS.length],
      };
    }
    const title = it.title || it.label || "";
    const description = it.description ?? DEFAULT_DESCRIPTIONS[i % DEFAULT_DESCRIPTIONS.length];
    
    // Fallback if item has specific string icon
    let IconComp = LakeViewIcon;
    if (typeof it.icon === "string") {
      const idx = ["lake", "ac", "wifi", "chef", "pickup", "parking"].indexOf(it.icon.toLowerCase());
      if (idx !== -1) {
        IconComp = CUSTOM_ICONS[idx];
      } else {
        IconComp = CUSTOM_ICONS[i % CUSTOM_ICONS.length];
      }
    } else {
      IconComp = CUSTOM_ICONS[i % CUSTOM_ICONS.length];
    }
    
    return { title, description, icon: IconComp };
  });
}

export function Highlights({ cmsData }: { cmsData?: { eyebrow?: string; title?: string; description?: string; items?: any[] } }) {
  const sectionRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow || "The Villa Experience";
  const title = cmsData?.title || "Crafted for the discerning escape.";
  const descriptionText = cmsData?.description || "Every detail at Lake View Villa is engineered to erase friction and deliver serenity.";

  const HIGHLIGHTS = useMemo(() => {
    const rawItems = Array.isArray(cmsData?.items) && cmsData.items.length > 0
      ? cmsData.items
      : [...RAW_HIGHLIGHTS];
    return normalize(rawItems as Item[]);
  }, [cmsData]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const tiles = featuresRef.current?.querySelectorAll<HTMLElement>("[data-tile]");
      if (!tiles?.length) return;

      // Staggered reveal with custom springy curves
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: "cubic-bezier(0.16, 1, 0.3, 1)",
          scrollTrigger: {
            trigger: featuresRef.current,
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
      id="highlights"
      aria-labelledby="highlights-heading"
      className="relative overflow-hidden bg-background py-24 md:py-32 border-t border-border/40"
    >
      {/* Background Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[45rem]"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, var(--color-gold-muted) 0%, transparent 70%)",
          opacity: 0.04
        }}
      />

      {/* Header Block */}
      <div className="lv-container relative pb-20">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={descriptionText}
        />
      </div>

      {/* Bento Grid Features with Staggered Asymmetry & Double Bezel */}
      <div className="lv-container relative">
        <div
          ref={featuresRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {HIGHLIGHTS.map(({ title: itemTitle, description, icon: Icon }, idx) => {
            // Asymmetric bento grid layout definitions
            let sizeClass = "col-span-1";
            if (idx === 0) sizeClass = "col-span-1 lg:col-span-2"; // 1st item spans 2 cols
            if (idx === 3) sizeClass = "col-span-1 sm:col-span-2 lg:col-span-2"; // 4th item spans 2 cols on tablet & desktop
            
            // To break the strict horizontal grid visual flow, we apply a subtle vertical offset (stagger) on larger screens
            const verticalStaggerClass = 
              idx % 3 === 1 
                ? "lg:translate-y-8" 
                : idx % 3 === 2 
                  ? "lg:translate-y-4" 
                  : "lg:-translate-y-4";

            return (
              <article
                key={`${itemTitle}-${idx}`}
                data-tile
                tabIndex={0}
                aria-label={`Amenity: ${itemTitle}`}
                className={[
                  "group relative p-[1px] rounded-sm bg-gradient-to-b from-foreground/10 to-transparent dark:from-white/5 dark:to-transparent transition-all duration-500 hover:scale-[1.015] hover:shadow-[0_20px_50px_rgba(11,32,39,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
                  sizeClass,
                  verticalStaggerClass
                ].join(" ")}
              >
                {/* Inner Bezel core - ultra-sharp geometry (rounded-sm) */}
                <div className="relative w-full h-full rounded-[3px] overflow-hidden bg-card p-8 md:p-10 border border-foreground/5 dark:border-white/5 flex flex-col justify-between min-h-[300px]">
                  
                  {/* Subtle Lagoon gradient glow overlay on hover */}
                  <div 
                    aria-hidden="true" 
                    className="absolute inset-0 -z-10 bg-gradient-to-br from-tidal/5 via-sage/2 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" 
                  />

                  {/* Top line indicator - subtle layout breaker */}
                  <div className="flex justify-between items-start mb-8">
                    {/* Icon container - minimalist double bezel */}
                    <div className="inline-flex h-12 w-12 items-center justify-center border border-accent/20 bg-accent/5 text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-background group-hover:scale-105 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                      <Icon />
                    </div>

                    {/* Numeric watermark indicator */}
                    <span
                      aria-hidden="true"
                      className="select-none font-display font-bold text-foreground/[0.04] dark:text-white/[0.03] leading-none transition-all duration-500 group-hover:text-accent/[0.06] group-hover:scale-105"
                      style={{ fontSize: "3.5rem" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Text content details */}
                  <div className="mt-auto">
                    <h3 className="mb-3 font-display text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent">
                      {itemTitle}
                    </h3>

                    <p className="max-w-xl font-sans text-sm leading-relaxed text-foreground/70 dark:text-foreground/80">
                      {description}
                    </p>
                  </div>

                  {/* Micro-interaction interactive bottom element */}
                  <div className="mt-8 pt-4 border-t border-foreground/[0.03] dark:border-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-accent opacity-0 -translate-x-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      <span>Inquire Now</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Bottom luxury border-wipe indicator */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-tidal via-sage to-gold transition-transform duration-500 group-hover:scale-x-100"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

