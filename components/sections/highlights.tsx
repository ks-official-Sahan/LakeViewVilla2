"use client";

import { useRef, useMemo } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap, EASE, DURATION } from "@/lib/gsap";
import {
  SunMedium, Wifi, Utensils, BedDouble, Waves,
  MapPin, Sparkles, Wind, ShieldCheck, Plane, ArrowUpRight
} from "lucide-react";
import { HIGHLIGHTS as RAW_HIGHLIGHTS } from "@/data/content";

type Item =
  | string
  | { title: string; description?: string; icon?: React.ComponentType<{ className?: string }> };

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

const DEFAULT_ICONS = [
  SunMedium, BedDouble, Wifi, Utensils, Plane, MapPin, Wind, Sparkles, Waves, ShieldCheck,
];

const AMENITY_LABELS = [
  "Lagoon Views", "Air Conditioning", "50+ Mbps Wi-Fi", "Private Chef",
  "Airport Transfers", "Free Parking", "Beach Access", "Housekeeping",
  "Lagoon Swimming", "Gated Privacy",
];

function normalize(items: Item[]) {
  return items.map((it, i) =>
    typeof it === "string"
      ? { title: it, description: DEFAULT_DESCRIPTIONS[i % DEFAULT_DESCRIPTIONS.length], icon: DEFAULT_ICONS[i % DEFAULT_ICONS.length] }
      : { title: it.title, description: it.description ?? DEFAULT_DESCRIPTIONS[i % DEFAULT_DESCRIPTIONS.length], icon: it.icon ?? DEFAULT_ICONS[i % DEFAULT_ICONS.length] }
  );
}

function AmenityMarquee() {
  const items = [...AMENITY_LABELS, ...AMENITY_LABELS, ...AMENITY_LABELS];
  return (
    <div
      className="relative w-full overflow-hidden border-y border-[var(--color-border)]/50 py-6 bg-[var(--color-surface)]/20"
      aria-hidden="true"
    >
      <div className="marquee-track flex gap-12 will-change-transform">
        {items.map((label, i) => (
          <span
            key={i}
            className="whitespace-nowrap font-serif text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)] flex items-center gap-3 shrink-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Highlights({ cmsData }: { cmsData?: { eyebrow?: string; title?: string; description?: string; items?: any[] } }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow || "The Villa Experience";
  const descriptionText = cmsData?.description || "Every detail at Lake View Villa is engineered to erase friction and deliver serenity — from the moment you arrive until the moment you reluctantly depart.";

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

      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.premium,
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
        }
      );

      const tiles = featuresRef.current?.querySelectorAll<HTMLElement>("[data-tile]");
      if (!tiles?.length) return;

      gsap.fromTo(
        tiles,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 1.0, stagger: 0.08, ease: EASE.premium,
          scrollTrigger: { trigger: featuresRef.current, start: "top 80%", once: true },
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
      className="relative overflow-hidden bg-[var(--color-background)] py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem]"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(var(--color-gold-rgb), 0.05) 0%, transparent 70%)",
        }}
      />

      {/* Header Block */}
      <div className="lv-container relative pb-16">
        <div ref={headingRef} className="max-w-3xl">
          <p className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-[var(--color-gold)]" />
            <span className="font-bold uppercase tracking-[0.25em] text-[var(--color-gold)] text-xs">
              {eyebrow}
            </span>
          </p>

          <h2
            id="highlights-heading"
            className="font-serif font-black leading-[1.08] tracking-tight text-[var(--color-foreground)]"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
          >
            Crafted for the{" "}
            <span className="italic text-[var(--color-gold)] font-medium">discerning</span>
            <br />
            escape.
          </h2>

          <p className="mt-6 max-w-xl text-[var(--color-muted)] leading-relaxed text-base">
            {descriptionText}
          </p>
        </div>
      </div>

      {/* Marquee Amenity Strip */}
      <AmenityMarquee />

      {/* Bento Grid Features */}
      <div className="lv-container relative mt-16">
        <div
          ref={featuresRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {HIGHLIGHTS.map(({ title, description, icon: Icon }, idx) => {
            // Asymmetrical grid column/row spanning for Awwwards style
            let sizeClass = "col-span-1";
            if (idx === 0) sizeClass = "col-span-1 lg:col-span-2";
            if (idx === 4) sizeClass = "col-span-1 sm:col-span-2 lg:col-span-1";

            return (
              <article
                key={`${title}-${idx}`}
                data-tile
                tabIndex={0}
                aria-label={`Amenity: ${title}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-8 transition-all duration-500 hover:border-[var(--color-gold)]/40 hover:shadow-[0_12px_40px_rgba(201,165,90,0.08)] ${sizeClass}`}
              >
                {/* Visual Glassmorphic glow on hover */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Large Background Number */}
                <span
                  aria-hidden
                  className="absolute right-6 top-4 select-none font-serif font-black text-[var(--color-foreground)]/[0.03] leading-none transition-all duration-500 group-hover:text-[var(--color-gold)]/[0.05] group-hover:scale-105"
                  style={{ fontSize: "clamp(5rem, 12vw, 9rem)" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Top card layout */}
                <div>
                  <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 text-[var(--color-gold)] transition-all duration-500 group-hover:border-[var(--color-gold)] group-hover:bg-[var(--color-gold)] group-hover:text-white">
                    {Icon ? (
                      <Icon className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>

                  <h3 className="mb-3 font-serif text-xl font-bold text-[var(--color-foreground)] transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                    {title}
                  </h3>

                  <p className="max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
                    {description}
                  </p>
                </div>

                {/* Bottom link detail */}
                <div className="mt-8 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] opacity-0 transform translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <span>Explore Details</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>

                {/* Gold accent line indicator */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] transition-transform duration-500 group-hover:scale-x-100"
                />
              </article>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
        .marquee-track {
          animation: marqueeScroll 35s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
