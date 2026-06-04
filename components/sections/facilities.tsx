"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { gsap, EASE, DURATION } from "@/lib/gsap";
import { FACILITIES } from "@/data/content";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";

interface FacilitiesSectionProps {
  cmsData?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items?: any[];
  };
}

export default function FacilitiesSection({ cmsData }: FacilitiesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow || "Best Choice";
  const title = cmsData?.title || "Villa Facilities";
  const descriptionText = cmsData?.description || "Swipe on mobile or use the arrows to browse every amenity.";

  const facilitiesList = Array.isArray(cmsData?.items) && cmsData.items.length > 0
    ? cmsData.items
    : FACILITIES;

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.premium,
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
        }
      );

      gsap.fromTo(
        carouselRef.current,
        { opacity: 0, y: 50, scale: 0.98 },
        {
          opacity: 1, y: 0, scale: 1, duration: 1.2, ease: EASE.premium, delay: 0.15,
          scrollTrigger: { trigger: carouselRef.current, start: "top 82%", once: true },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="facilities-heading"
      className="relative overflow-hidden py-24 md:py-36 bg-[var(--color-background)] border-t border-[var(--color-border)]/50"
    >
      {/* Background glow overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[30rem]"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 75% 0%, rgba(var(--color-gold-rgb), 0.05) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-8">
        {/* Title Heading */}
        <div ref={headingRef} className="mb-16 flex flex-col items-center md:items-start md:text-left text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
            {eyebrow}
          </p>
          <div className="flex items-center gap-3">
            <h2
              id="facilities-heading"
              className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] font-black tracking-tight text-[var(--color-foreground)] leading-tight"
            >
              {title}
            </h2>
            <Sparkles className="h-6 w-6 text-[var(--color-gold)] animate-pulse hidden md:block" />
          </div>
          <p className="mt-4 max-w-xl text-base text-[var(--color-muted)] leading-relaxed">
            {descriptionText}
          </p>
        </div>

        {/* Draggable Carousel */}
        <div ref={carouselRef} className="relative">
          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full select-none"
          >
            <CarouselContent className="-ml-6">
              {facilitiesList.map((f, i) => (
                <CarouselItem
                  key={f.id || i}
                  className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <article className="group relative flex h-full min-h-[25rem] flex-col justify-end overflow-hidden rounded-3xl border border-[var(--color-border)]/50 bg-[var(--color-surface)] p-6 shadow-md transition-all duration-500 hover:border-[var(--color-gold)]/40 hover:shadow-[0_12px_40px_rgba(201,165,90,0.08)]">
                    
                    {/* Facility Card Media */}
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={f.image}
                        alt={f.alt || f.title}
                        fill
                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      
                      {/* Dark Overlay vignettes */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                    </div>

                    {/* Badge */}
                    {f.badge && (
                      <span className="absolute left-6 top-6 z-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                        {f.badge}
                      </span>
                    )}

                    {/* Content Details */}
                    <div className="relative z-10 text-white">
                      <h3 className="font-serif text-xl font-bold leading-tight tracking-tight text-white mb-2.5 transition-colors duration-300 group-hover:text-[var(--color-gold)]">
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/70">
                        {f.description}
                      </p>
                    </div>

                    {/* Accent line reveal */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] transition-transform duration-500 group-hover:scale-x-100"
                    />
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom styled arrow buttons */}
            <div className="absolute top-[-80px] right-6 hidden items-center gap-3 md:flex">
              <CarouselPrevious
                aria-label="Previous facility"
                className="static translate-y-0 h-11 w-11 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-gold)] hover:bg-[var(--color-surface)] shadow-md transition-all rounded-full cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </CarouselPrevious>
              <CarouselNext
                aria-label="Next facility"
                className="static translate-y-0 h-11 w-11 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-gold)] hover:bg-[var(--color-surface)] shadow-md transition-all rounded-full cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </CarouselNext>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
