"use client";

import { useRef, useMemo } from "react";
import { gsap, useGSAP, EASE, DURATION } from "@/lib/gsap";
import {
  SunMedium, Wifi, Utensils, BedDouble, Waves, MapPin, Sparkles, Wind, ShieldCheck, Plane, ArrowUpRight,
} from "lucide-react";
import { HIGHLIGHTS as RAW_HIGHLIGHTS } from "@/data/content";
import { SectionHeading } from "@/components/ui/section-heading";

type Item = string | { title: string; description?: string; icon?: React.ComponentType<{ className?: string }> };

const DEFAULT_DESCRIPTIONS = [
  "Sunrise over the lagoon, framed from every bedroom window.",
  "Climate-controlled suites with hotel-grade linens and blackout drapes.",
  "Lightning-fast connectivity — 50+ Mbps, wherever you roam on the estate.",
  "Private chef service on request — Sri Lankan feasts or continental.",
  "Airport transfers, tour curation, and 24/7 on-call support.",
  "Secure, gated on-site parking at no additional cost.",
] as const;

const ICONS: React.ComponentType<{ className?: string }>[] = [
  Waves, BedDouble, Wifi, Utensils, Plane, MapPin,
];

const ACCENT_COLORS = [
  "from-sky-500/10 to-cyan-400/5",
  "from-amber-500/10 to-yellow-400/5",
  "from-emerald-500/10 to-teal-400/5",
  "from-orange-500/10 to-red-400/5",
  "from-indigo-500/10 to-blue-400/5",
  "from-rose-500/10 to-pink-400/5",
] as const;

const ICON_BG = [
  "bg-sky-500/15 text-sky-400",
  "bg-amber-500/15 text-amber-400",
  "bg-emerald-500/15 text-emerald-400",
  "bg-orange-500/15 text-orange-400",
  "bg-indigo-500/15 text-indigo-400",
  "bg-rose-500/15 text-rose-400",
] as const;

function normalise(raw: readonly Item[]) {
  return Array.from(raw).map((item, i) => {
    if (typeof item === "string") {
      return { title: item, description: DEFAULT_DESCRIPTIONS[i % DEFAULT_DESCRIPTIONS.length], icon: ICONS[i % ICONS.length] };
    }
    return { title: item.title, description: item.description ?? DEFAULT_DESCRIPTIONS[i % DEFAULT_DESCRIPTIONS.length], icon: item.icon ?? ICONS[i % ICONS.length] };
  });
}

export function GalleryTeaser({ cmsData }: { cmsData?: { eyebrow?: string; title?: string; description?: string; items?: Item[] } }) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow ?? "Why Lake View Villa";
  const title = cmsData?.title ?? "Every detail curated for you";
  const description = cmsData?.description ?? "Six reasons guests return, season after season — a stay that goes far beyond four walls.";

  const items = useMemo(() => {
    const raw: readonly Item[] = Array.isArray(cmsData?.items) && (cmsData?.items?.length ?? 0) > 0 ? (cmsData!.items as Item[]) : RAW_HIGHLIGHTS;
    return normalise(raw).slice(0, 6);
  }, [cmsData]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      // Badge reveal
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current, { opacity: 0, scale: 0.85 }, {
          opacity: 1, scale: 1, duration: 0.7, ease: EASE.elastic,
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        });
      }

      // Card stagger reveal
      const cards = gridRef.current?.querySelectorAll<HTMLElement>("[data-card]");
      if (cards?.length) {
        gsap.fromTo(cards, { opacity: 0, y: 56, scale: 0.96 }, {
          opacity: 1, y: 0, scale: 1, duration: 1.0, ease: EASE.premium,
          stagger: { amount: 0.55, from: "start" },
          scrollTrigger: { trigger: gridRef.current, start: "top 80%", once: true },
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="highlights"
      aria-labelledby="highlights-heading"
      className="relative overflow-hidden py-28 md:py-40 bg-[var(--color-background)] border-t border-[var(--color-border)]/40"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,165,90,0.06) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-12">
        {/* Section header */}
        <div className="mb-20 flex flex-col items-center text-center">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />
        </div>

        {/* Bento grid */}
        <div ref={gridRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {items.map((item, i) => {
            const Icon = item.icon;
            const isLarge = i === 0 || i === 3;

            return (
              <article key={i} data-card role="listitem"
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)] ${isLarge ? "lg:col-span-1 min-h-[300px]" : "min-h-[260px]"}`}
              >
                <div aria-hidden className={`pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-br ${ACCENT_COLORS[i]} opacity-60 transition-opacity duration-500 group-hover:opacity-100`} />
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.045) 50%, transparent 70%)" }} />

                <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-9">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${ICON_BG[i]} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-4deg]`}>
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <span className="font-mono text-[0.65rem] font-bold tracking-[0.2em] text-[var(--color-border)] select-none">0{i + 1}</span>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-3 font-[var(--font-serif)] text-xl font-bold text-[var(--color-foreground)] leading-snug">{item.title}</h3>
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">{item.description}</p>
                    <div className="mt-6 flex items-center gap-2 opacity-0 -translate-x-1.5 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">Learn more</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-gold)]" aria-hidden />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Trust badge row */}
        <div ref={badgeRef} className="mt-20 flex flex-wrap items-center justify-center gap-4" aria-label="Trust signals">
          {[
            { icon: ShieldCheck, label: "Verified Property" },
            { icon: Sparkles, label: "Curated Experience" },
            { icon: Wind, label: "5-Star Cleanliness" },
          ].map(({ icon: BadgeIcon, label }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-full border border-[var(--color-border)]/60 bg-[var(--color-surface)] px-5 py-2.5 shadow-sm">
              <BadgeIcon className="h-4 w-4 text-[var(--color-gold)]" aria-hidden />
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-foreground)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
