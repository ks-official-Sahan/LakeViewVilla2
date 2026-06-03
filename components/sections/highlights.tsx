"use client";

import { useRef, useMemo } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap, EASE, DURATION } from "@/lib/gsap";
import {
  SunMedium, Wifi, Utensils, BedDouble, Waves,
  MapPin, Sparkles, Wind, ShieldCheck, Plane,
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

// Concise amenity labels for the marquee strip
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

/** Horizontal marquee strip of amenity pills — no JS, pure CSS animation */
function AmenityMarquee() {
  const items = [...AMENITY_LABELS, ...AMENITY_LABELS]; // duplicate for seamless loop
  return (
    <div
      className="relative w-full overflow-hidden border-y border-[var(--color-gold)]/20 py-4"
      aria-hidden="true"
    >
      <div className="marquee-track flex gap-10 will-change-transform">
        {items.map((label, i) => (
          <span
            key={i}
            className="whitespace-nowrap font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] text-[0.625rem] sm:text-xs flex items-center gap-2 shrink-0"
          >
            <span className="inline-block h-px w-4 bg-[var(--color-gold)]/50" />
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
        { opacity: 0, y: 48 },
        {
          opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.premium,
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
        }
      );

      const tiles = featuresRef.current?.querySelectorAll<HTMLElement>("[data-tile]");
      if (!tiles?.length) return;

      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(
          tiles,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0, duration: 0.65, stagger: 0.07, ease: EASE.out,
            scrollTrigger: { trigger: featuresRef.current, start: "top 88%", once: true },
          }
        );
      });

      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(
          tiles,
          { opacity: 0, y: 56, rotateX: 8, transformOrigin: "top center" },
          {
            opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.08, ease: EASE.out,
            scrollTrigger: { trigger: featuresRef.current, start: "top 82%", once: true },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="highlights"
      aria-labelledby="highlights-heading"
      className="relative overflow-hidden bg-[var(--color-background)]"
    >
      {/* Subtle warm-gold ambient wash — top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[30rem]"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(184,147,63,.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Header block ──────────────────────────────────────────────── */}
      <div className="lv-container relative pt-[clamp(4rem,10vw,7rem)] pb-[clamp(2.5rem,6vw,4rem)]">
        <div ref={headingRef} className="max-w-3xl">
          {/* Eyebrow */}
          <p className="flex items-center gap-3 mb-[clamp(0.75rem,2vw,1.25rem)]">
            <span className="inline-block h-px w-8 bg-[var(--color-gold)]" />
            <span className="font-bold uppercase tracking-[0.22em] text-[var(--color-gold)] text-[0.625rem] sm:text-xs">
              {eyebrow}
            </span>
          </p>

          {/* Main heading — editorial asymmetric */}
          <h2
            id="highlights-heading"
            className="font-[var(--font-display)] font-black leading-[1.04] tracking-[-0.02em] text-[var(--color-foreground)]"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 5rem)" }}
          >
            {cmsData?.title ? (
              cmsData.title
            ) : (
              <>
                Crafted for{" "}
                <span
                  className="relative inline-block"
                  style={{
                    backgroundImage: "linear-gradient(120deg, var(--color-gold) 0%, #e8c87d 50%, var(--color-gold) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  discerning
                </span>{" "}
                <br className="hidden sm:block" />
                guests.
              </>
            )}
          </h2>

          <p className="mt-[clamp(1rem,2.5vw,1.5rem)] max-w-xl text-[var(--color-muted)] leading-relaxed text-[clamp(0.9rem,1.5vw,1.0625rem)]">
            {descriptionText}
          </p>
        </div>
      </div>

      {/* ── Marquee amenity strip ──────────────────────────────────────── */}
      <AmenityMarquee />

      {/* ── Feature tiles — asymmetric numbered editorial grid ────────── */}
      <div className="lv-container relative py-[clamp(3rem,7vw,5.5rem)]">
        <div
          ref={featuresRef}
          className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 bg-[var(--color-border)]"
          style={{ borderRadius: 0 }}
        >
          {HIGHLIGHTS.map(({ title, description, icon: Icon }, idx) => (
            <article
              key={`${title}-${idx}`}
              data-tile
              tabIndex={0}
              aria-label={`Amenity: ${title}`}
              className="group relative cursor-default bg-[var(--color-background)] p-[clamp(1.5rem,3.5vw,2.25rem)] transition-colors duration-300 hover:bg-[var(--color-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-inset overflow-hidden"
            >
              {/* Number — large ghosted editorial accent */}
              <span
                aria-hidden
                className="absolute right-4 top-3 font-[var(--font-display)] font-black text-[var(--color-foreground)]/[0.04] select-none pointer-events-none leading-none"
                style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <div className="mb-[clamp(1rem,2.5vw,1.5rem)] inline-flex h-10 w-10 items-center justify-center rounded-none border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/8 transition-all duration-300 group-hover:border-[var(--color-gold)]/60 group-hover:bg-[var(--color-gold)]/15">
                {Icon ? (
                  <Icon className="h-4.5 w-4.5 text-[var(--color-gold)]" />
                ) : (
                  <Sparkles className="h-4.5 w-4.5 text-[var(--color-gold)]" />
                )}
              </div>

              {/* Title */}
              <h3 className="mb-2 font-[var(--font-display)] font-semibold text-[var(--color-foreground)] text-[clamp(0.9rem,1.5vw,1.0625rem)] tracking-tight group-hover:text-[var(--color-gold)] transition-colors duration-200">
                {title}
              </h3>

              {/* Description */}
              <p className="text-[var(--color-muted)] leading-relaxed text-[clamp(0.8rem,1.1vw,0.9375rem)]">
                {description}
              </p>

              {/* Gold bottom reveal line */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--color-gold)] transition-transform duration-500 group-hover:scale-x-100"
              />
            </article>
          ))}
        </div>
      </div>

      {/* CSS for marquee animation */}
      <style jsx global>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marqueeScroll 28s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
