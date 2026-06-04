"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { gsap, EASE, DURATION } from "@/lib/gsap";
import { ChevronLeft, ChevronRight, MapPin, Compass, ArrowUpRight } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/data/site";

type Experience = {
  name: string;
  image: string;
  thumb?: string;
  description: string;
  ctaHref: string;
};

const sendMsg = (loc: string) =>
  buildWhatsAppUrl(
    SITE_CONFIG.whatsappNumber,
    `Hi, I would like to book a day trip to ${loc} with Lake View Villa.`
  );

const EXPERIENCES: Experience[] = [
  { name: "Rekawa Turtle Beach", image: "/images/optimized/rekawa.webp", description: "One of Sri Lanka's most important turtle nesting sites — witness nature's oldest ritual at dusk.", ctaHref: sendMsg("Rekawa Turtle Beach") },
  { name: "Hiriketiya Beach", image: "/images/optimized/hiriketiya.webp", description: "A crescent bay beloved by surfers and yogis alike — crystal water, golden sand, zero crowds.", ctaHref: sendMsg("Hiriketiya Beach") },
  { name: "Lagoon Kayaking", image: "/images/optimized/kayaking.webp", description: "Paddle through mirror-calm waters flanked by mangroves, birds, and absolute silence.", ctaHref: sendMsg("Tangalle Lagoon Kayaking") },
  { name: "Kalamatiya Sanctuary", image: "/images/optimized/kalamatiya.webp", description: "A coastal wetland where flamingoes, pelicans, and painted storks make their seasonal home.", ctaHref: sendMsg("Kalamatiya Bird Sanctuary") },
  { name: "Mulkirigala Rock Temple", image: "/images/optimized/mulkirigala.webp", description: "An ancient Buddhist monastery carved into a dramatic rock face — 2,200 years of living history.", ctaHref: sendMsg("Mulkirigala Rock Temple") },
  { name: "Yala National Park", image: "/images/optimized/yala.webp", description: "Leopards, elephants, sloth bears — the world's densest leopard population in raw Sri Lankan wilderness.", ctaHref: sendMsg("Yala National Park") },
  { name: "Hummanaya Blowhole", image: "/images/optimized/blowhole.webp", description: "Sri Lanka's largest blowhole shoots seawater 18 metres into the air — a geological spectacle.", ctaHref: sendMsg("Hummanaya Blowhole") },
  { name: "Sigiriya Rock Fortress", image: "/images/optimized/sigiriya.webp", description: "A UNESCO World Heritage Site — an ancient palace city perched atop a towering volcanic rock.", ctaHref: sendMsg("Sigiriya Rock Fortress") },
];

export function ExperiencesReel({ cmsData }: { cmsData?: { eyebrow?: string; title?: string; description?: string; items?: any[] } }) {
  const itemsList = useMemo(() => {
    return Array.isArray(cmsData?.items) && cmsData.items.length > 0
      ? cmsData.items
      : EXPERIENCES;
  }, [cmsData]);

  const wrap = useCallback((i: number) => ((i % itemsList.length) + itemsList.length) % itemsList.length, [itemsList]);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const eyebrow = cmsData?.eyebrow || "Surroundings & Activities";
  const title = cmsData?.title || "Lagoon Life & Coastal Safaris";
  const descriptionText = cmsData?.description || "Wander beyond the gates to find ancient temples, protected turtle beaches, and Sri Lanka's finest wildlife reserves.";

  const prefersReduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (paused || prefersReduced) return;
    autoRef.current = setInterval(() => setIndex((i) => wrap(i + 1)), 6000);
    return () => clearInterval(autoRef.current);
  }, [paused, prefersReduced, wrap]);

  const go = useCallback((dir: 1 | -1) => {
    if (isChanging) return;
    setIsChanging(true);
    setIndex((i) => wrap(i + dir));
    clearInterval(autoRef.current);
    setPaused(false);
    setTimeout(() => setIsChanging(false), 900);
  }, [isChanging, wrap]);

  // Section entrance reveal
  useGSAP(
    () => {
      if (prefersReduced) return;
      gsap.fromTo(headingRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.premium,
        scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
      });
      gsap.fromTo(reelRef.current, { opacity: 0, scale: 0.96, filter: "blur(10px)" }, {
        opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.4, ease: EASE.premium,
        scrollTrigger: { trigger: reelRef.current, start: "top 80%", once: true },
      });
    },
    { scope: sectionRef }
  );

  // Stagger reveal slide content
  useEffect(() => {
    if (!slideRef.current || !infoRef.current || prefersReduced) return;
    const tl = gsap.timeline();
    
    tl.fromTo(
      slideRef.current, 
      { filter: "brightness(0.45) contrast(1.15)", scale: 1.12 }, 
      { filter: "brightness(1) contrast(1)", scale: 1, duration: 1.4, ease: "power4.out" }
    );
    
    tl.fromTo(
      infoRef.current.children, 
      { opacity: 0, y: 40, filter: "blur(6px)" }, 
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", stagger: 0.12 }, 
      "-=1.1"
    );
  }, [index, prefersReduced]);

  const prev = wrap(index - 1);
  const next = wrap(index + 1);
  const cur = itemsList[index] || itemsList[0];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      setPaused((p) => !p);
    }
  };

  if (!cur) return null;

  return (
    <section
      ref={sectionRef}
      id="experiences"
      aria-labelledby="experiences-heading"
      className="relative overflow-hidden py-24 md:py-36 bg-[var(--color-background)] border-t border-[var(--color-border)]/50"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
        style={{ backgroundImage: "url('/noise.svg')" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 60%)" }} />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-8">
        {/* Title Block */}
        <div ref={headingRef} className="mb-16 flex flex-col items-center md:items-start text-center md:text-left">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
            <Compass className="h-4 w-4 text-[var(--color-gold)]" /> 
            <span>{eyebrow}</span>
          </p>
          <h2 id="experiences-heading"
            className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] font-black tracking-tight text-[var(--color-foreground)] leading-[1.05] max-w-3xl">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-base text-[var(--color-muted)] leading-relaxed">
            {descriptionText}
          </p>
        </div>

        {/* Cinematic Slider */}
        <div
          ref={reelRef}
          className="relative mx-auto w-full select-none focus-visible:outline-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Experiences slideshow"
        >
          {/* Left arrow background preview button */}
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={isChanging}
            aria-label={`Previous: ${itemsList[prev]?.name}`}
            className="group absolute left-0 top-0 bottom-0 z-20 hidden md:block w-[14%] overflow-hidden rounded-l-3xl border-r border-white/5 transition-all hover:w-[16%] cursor-pointer"
          >
            <div className="absolute inset-0">
              <Image src={itemsList[prev]?.image || "/images/placeholder.jpg"} alt="" aria-hidden fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-108 saturate-50 brightness-[0.4]" sizes="15vw" />
              <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:bg-black/30" />
            </div>
            <div className="absolute inset-y-0 right-6 flex items-center text-white/40 group-hover:text-white transition-all group-hover:-translate-x-2">
              <ChevronLeft className="h-10 w-10 border border-white/10 rounded-full p-2 bg-white/5 backdrop-blur-md" />
            </div>
          </button>

          {/* Right arrow background preview button */}
          <button
            type="button"
            onClick={() => go(1)}
            disabled={isChanging}
            aria-label={`Next: ${itemsList[next]?.name}`}
            className="group absolute right-0 top-0 bottom-0 z-20 hidden md:block w-[14%] overflow-hidden rounded-r-3xl border-l border-white/5 transition-all hover:w-[16%] cursor-pointer"
          >
            <div className="absolute inset-0">
              <Image src={itemsList[next]?.image || "/images/placeholder.jpg"} alt="" aria-hidden fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-108 saturate-50 brightness-[0.4]" sizes="15vw" />
              <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:bg-black/30" />
            </div>
            <div className="absolute inset-y-0 left-6 flex items-center text-white/40 group-hover:text-white transition-all group-hover:translate-x-2">
              <ChevronRight className="h-10 w-10 border border-white/10 rounded-full p-2 bg-white/5 backdrop-blur-md" />
            </div>
          </button>

          {/* Core frame */}
          <div
            aria-label={cur.name}
            className="relative mx-0 md:mx-[14%] overflow-hidden rounded-3xl bg-[#0a0f10] shadow-[0_24px_60px_rgba(0,0,0,0.35)] border border-[var(--color-border)]/50"
            style={{ height: "clamp(32rem, 58vw, 44rem)" }}
          >
            <div ref={slideRef} className="absolute inset-0">
              <Image
                key={index}
                src={cur.image}
                alt={cur.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 75vw"
                priority
              />
            </div>

            {/* Visual Scrim Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

            {/* Mobile navigation overlays */}
            <div className="absolute top-1/2 left-4 right-4 flex justify-between -translate-y-1/2 md:hidden z-20">
              <button onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Slide Information */}
            <div ref={infoRef} className="absolute inset-x-0 bottom-0 p-8 md:p-14 text-white z-10 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-gold)] backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5" />
                <span>Excursion</span>
              </div>
              <h3 className="mb-4 font-serif text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl text-white">
                {cur.name}
              </h3>
              <p className="mb-8 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                {cur.description}
              </p>
              <a
                href={cur.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[#0f1011] shadow-lg transition-all hover:bg-[var(--color-gold)] hover:text-white"
              >
                <span>Inquire & Plan Excursion</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:bg-white group-hover:text-[var(--color-gold)] group-hover:translate-x-1">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>
            </div>

            {/* Sweep progress timeline tracker */}
            <div className="absolute inset-x-0 top-0 flex h-1.5 w-full bg-black/35">
              {!paused && !prefersReduced && (
                <div
                  key={`${index}-bar`}
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)]"
                  style={{ animation: "progressBar 6s linear forwards" }}
                />
              )}
            </div>
          </div>

          {/* Minimal Dot Indicators */}
          <div className="mt-8 flex items-center justify-center gap-3" role="tablist" aria-label="Slide indicators">
            {itemsList.map((exp, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Select: ${exp.name}`}
                onClick={() => { setIndex(i); clearInterval(autoRef.current); }}
                className={`relative h-1.5 rounded-full transition-all duration-500 overflow-hidden cursor-pointer ${
                  i === index
                    ? "w-14 bg-transparent"
                    : "w-3.5 bg-[var(--color-border)] hover:bg-[var(--color-gold)]/40"
                }`}
              >
                {i === index && (
                  <>
                    <div className="absolute inset-0 bg-[var(--color-border)]/30" />
                    <div 
                      key={`progress-${index}`}
                      className="absolute inset-y-0 left-0 bg-[var(--color-gold)]" 
                      style={!paused && !prefersReduced ? { animation: "progressBar 6s linear forwards" } : { width: '100%' }}
                    />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
