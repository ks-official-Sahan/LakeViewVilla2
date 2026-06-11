"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@/lib/gsap";
import { gsap } from "@/lib/gsap";
import { Compass, ArrowUpRight } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";
import { SITE_CONFIG } from "@/data/site";

type Experience = {
  name: string;
  image: string;
  description: string;
  ctaHref: string;
};

const sendMsg = (loc: string) =>
  buildWhatsAppUrl(
    SITE_CONFIG.whatsappNumber,
    `Hi, I would like to book a day trip to ${loc} with Lake View Villa.`
  );

const EXPERIENCES: Experience[] = [
  { 
    name: "Rekawa Turtle Beach", 
    image: "/villa/optimized/beach_img_01.webp", 
    description: "Witness nesting sea turtles at dusk on a protected, wild coastal sanctuary.", 
    ctaHref: sendMsg("Rekawa Turtle Beach") 
  },
  { 
    name: "Hiriketiya Beach", 
    image: "/villa/optimized/villa_img_02.webp", 
    description: "A gorgeous horseshoe bay offering world-class surfing waves and beach yoga vibes.", 
    ctaHref: sendMsg("Hiriketiya Beach") 
  },
  { 
    name: "Lagoon Kayaking", 
    image: "/villa/optimized/lake_img_02.webp", 
    description: "Paddle mirror-like waters through dense, quiet mangrove forests.", 
    ctaHref: sendMsg("Tangalle Lagoon Kayaking") 
  },
  { 
    name: "Kalamatiya Sanctuary", 
    image: "/villa/optimized/lake_img_01.webp", 
    description: "Discover a birder's dream lagoon hosting vibrant seasonal flocks.", 
    ctaHref: sendMsg("Kalamatiya Bird Sanctuary") 
  },
  { 
    name: "Mulkirigala Rock Temple", 
    image: "/villa/optimized/garden_img_04.webp", 
    description: "Climb steps up a massive rock cave monastery containing 2,000 years of painted murals.", 
    ctaHref: sendMsg("Mulkirigala Rock Temple") 
  },
  { 
    name: "Yala Safari Excursion", 
    image: "/villa/optimized/drone_view_villa.webp", 
    description: "Track leopards and wild elephants in Sri Lanka's prime national wildlife park.", 
    ctaHref: sendMsg("Yala National Park") 
  },
];

function normalize(items: any[]): Experience[] {
  return items.map((it, i) => {
    const name = it.name || it.label || `Excursion ${i + 1}`;
    const description = it.description || "";
    
    const lowerName = name.toLowerCase();
    let image = "";
    let ctaHref = "";

    if (lowerName.includes("rekawa")) {
      image = "/villa/optimized/beach_img_01.webp";
      ctaHref = sendMsg("Rekawa Turtle Beach");
    } else if (lowerName.includes("hiriketiya")) {
      image = "/villa/optimized/villa_img_02.webp";
      ctaHref = sendMsg("Hiriketiya Beach");
    } else if (lowerName.includes("kayak") || lowerName.includes("lagoon")) {
      image = "/villa/optimized/lake_img_02.webp";
      ctaHref = sendMsg("Tangalle Lagoon Kayaking");
    } else if (lowerName.includes("kalamatiya")) {
      image = "/villa/optimized/lake_img_01.webp";
      ctaHref = sendMsg("Kalamatiya Bird Sanctuary");
    } else if (lowerName.includes("mulkirigala")) {
      image = "/villa/optimized/garden_img_04.webp";
      ctaHref = sendMsg("Mulkirigala Rock Temple");
    } else if (lowerName.includes("yala")) {
      image = "/villa/optimized/drone_view_villa.webp";
      ctaHref = sendMsg("Yala National Park");
    } else {
      const fallbackIndex = i % EXPERIENCES.length;
      const fallback = EXPERIENCES[fallbackIndex];
      image = fallback.image;
      ctaHref = fallback.ctaHref;
    }

    return {
      name,
      image: it.image || image || "/villa/optimized/villa_img_02.webp",
      description,
      ctaHref: it.ctaHref || ctaHref || sendMsg(name),
    };
  });
}

export function ExperiencesReel({ cmsData }: { cmsData?: { eyebrow?: string; title?: string; description?: string; items?: any[] } }) {
  const itemsList = useMemo(() => {
    return Array.isArray(cmsData?.items) && cmsData.items.length > 0
      ? normalize(cmsData.items)
      : EXPERIENCES;
  }, [cmsData]);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow || "Surroundings & Excursions";
  const title = cmsData?.title || "Lagoon Life & Coastal Safaris";
  const descriptionText = cmsData?.description || "Wander beyond the gates of Lake View Villa to uncover hidden beaches, nature sanctuaries, and historical heritage.";

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const track = trackRef.current;
        if (!track) return;

        // Calculate scroll width
        const scrollWidth = track.scrollWidth;
        const windowWidth = window.innerWidth;
        const scrollAmount = scrollWidth - windowWidth + (windowWidth * 0.1);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1.0,
            start: "top top",
            end: () => `+=${scrollAmount * 1.2}`,
            invalidateOnRefresh: true,
          },
        });

        // Horizontal translate
        tl.to(track, {
          x: -scrollAmount,
          ease: "none",
        }, 0);

        // Progress bar scale
        if (progressRef.current) {
          tl.fromTo(
            progressRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "none" },
            0
          );
        }

        // Apply visual image parallax inside horizontally moving cards
        const cards = track.querySelectorAll("[data-card]");
        cards.forEach((card) => {
          const img = card.querySelector("[data-parallax-img]");
          if (img) {
            tl.fromTo(
              img,
              { xPercent: -15 },
              { xPercent: 15, ease: "none" },
              0
            );
          }
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [itemsList] }
  );

  return (
    <section
      ref={sectionRef}
      id="experiences"
      aria-labelledby="experiences-heading"
      className="relative overflow-hidden bg-lagoon text-white border-t border-white/5"
    >
      {/* Subtle background noise overlay */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{ backgroundImage: "url('/noise.svg')" }} 
      />

      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP: Horizontal Scroll Cinema (Screen size md and up)
          ────────────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex sticky top-0 h-screen w-screen overflow-hidden py-20 flex-col justify-between">
        
        {/* Header bar */}
        <div className="lv-container flex justify-between items-end mb-4 z-10">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-4 block flex items-center gap-2">
              <Compass className="size-4 animate-spin-slow" /> {eyebrow}
            </span>
            <h2 
              id="experiences-heading"
              className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] max-w-2xl"
            >
              {title}
            </h2>
          </div>
          <p className="max-w-md text-sm text-white/60 font-sans leading-relaxed text-right pb-1 text-wrap-balance">
            {descriptionText}
          </p>
        </div>
        
        {/* Horizontal track containing cards */}
        <div 
          ref={trackRef} 
          className="flex flex-row gap-8 pl-[10vw] pr-[20vw] items-center h-[58vh] w-max z-10"
        >
          {itemsList.map((exp, idx) => (
            <div 
              key={idx}
              data-card
              className="w-[500px] lg:w-[580px] h-full p-[1px] rounded-sm bg-gradient-to-b from-white/10 to-transparent shrink-0"
            >
              <div className="relative w-full h-full rounded-[3px] overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.5)] border border-white/5 group">
                <div className="absolute inset-0 overflow-hidden">
                  <Image 
                    src={exp.image} 
                    alt={exp.name} 
                    fill 
                    className="object-cover h-full w-[130%] -left-[15%]" 
                    data-parallax-img 
                    sizes="(max-width: 1024px) 50vw, 40vw"
                    priority={idx < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity duration-300 group-hover:via-black/20" />
                </div>
                
                {/* Text card content overlay */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end z-10">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-3 block">
                    Tangalle, Sri Lanka
                  </span>
                  <h3 className="font-display text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight">
                    {exp.name}
                  </h3>
                  <p className="text-sm text-white/75 font-sans max-w-md mb-8 leading-relaxed">
                    {exp.description}
                  </p>
                  
                  <a 
                    href={exp.ctaHref} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-accent hover:text-white transition-colors group/link"
                  >
                    <span>Inquire Excursion</span>
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress bar pagination track */}
        <div className="lv-container flex justify-between items-center z-10 text-[9px] font-sans uppercase tracking-[0.25em] text-white/40 font-bold">
          <span>Scroll to Explore</span>
          <div className="w-80 h-px bg-white/10 relative">
            <div 
              ref={progressRef} 
              className="absolute left-0 top-0 h-full w-full bg-accent origin-left scale-x-0" 
            />
          </div>
          <span>{itemsList.length} Excursions</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE: Horizontal Native Swipe Layout (Screen size below md)
          ────────────────────────────────────────────────────────────────── */}
      <div className="md:hidden py-24 px-6 z-10 relative">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-accent mb-3 block flex items-center gap-2">
          <Compass className="size-4 animate-spin-slow" /> {eyebrow}
        </span>
        <h2 className="font-display text-3xl font-black tracking-tight text-white mb-4 leading-tight">
          {title}
        </h2>
        <p className="text-sm text-white/60 font-sans leading-relaxed mb-8">
          {descriptionText}
        </p>
        
        {/* Touch Horizontal scroll wrapper */}
        <div className="flex flex-row gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4">
          {itemsList.map((exp, idx) => (
            <div 
              key={idx}
              className="w-[290px] aspect-[4/5] p-[1px] rounded-sm bg-gradient-to-b from-white/10 to-transparent shrink-0 snap-start"
            >
              <div className="relative w-full h-full rounded-[3px] overflow-hidden shadow-xl border border-white/5">
                <Image src={exp.image} alt={exp.name} fill className="object-cover" sizes="80vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-accent mb-2">
                    Tangalle
                  </span>
                  <h3 className="font-display text-xl font-bold text-white mb-2 tracking-tight">
                    {exp.name}
                  </h3>
                  <p className="text-xs text-white/70 font-sans mb-5 leading-relaxed">
                    {exp.description}
                  </p>
                  <a 
                    href={exp.ctaHref} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[9px] font-sans font-bold uppercase tracking-widest text-accent"
                  >
                    <span>Inquire</span>
                    <ArrowUpRight className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

