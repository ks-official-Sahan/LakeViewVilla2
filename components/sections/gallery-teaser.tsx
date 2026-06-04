"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@/lib/gsap";
import { gsap, EASE, DURATION } from "@/lib/gsap";
import { X, ChevronLeft, ChevronRight, ArrowRight, Maximize2 } from "lucide-react";
import { BOOKING_FACTS } from "@/data/content";

export function GalleryTeaser({ cmsData }: { cmsData?: { eyebrow?: string; title?: string; description?: string; items?: any[] } }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const eyebrow = cmsData?.eyebrow || "Visual Story";
  const title = cmsData?.title || "A glimpse of paradise";
  const descriptionText = cmsData?.description || "Step into the serene elegance of Lake View Villa. Curated spaces designed to harmonize with the raw beauty of Tangalle's lagoon.";

  const images = useMemo(() => {
    return Array.isArray(cmsData?.items) && cmsData.items.length > 0
      ? cmsData.items
      : BOOKING_FACTS.images ?? [];
  }, [cmsData]);

  const preview = useMemo(() => images.slice(0, 6), [images]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      // Heading Reveal
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.reveal,
          ease: EASE.premium,
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", once: true },
        }
      );

      let revertParallax: (() => void) | undefined;

      const cells = gridRef.current?.querySelectorAll<HTMLElement>("[data-cell]");
      if (cells?.length) {
        // Stagger reveal cells
        gsap.fromTo(
          cells,
          { opacity: 0, y: 70, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: EASE.premium,
            stagger: 0.1,
            scrollTrigger: { trigger: gridRef.current, start: "top 80%", once: true },
          }
        );

        const mm = gsap.matchMedia();
        revertParallax = () => mm.revert();

        // Parallax image scrolling rate
        mm.add("(min-width: 768px)", () => {
          cells.forEach((cell, idx) => {
            const inner = cell.querySelector<HTMLElement>("[data-parallax]");
            if (!inner) return;

            let rate = 12;
            if (idx === 0 || idx === 3) rate = 20;
            else if (idx === 1 || idx === 5) rate = 8;

            gsap.fromTo(
              inner,
              { yPercent: -rate },
              {
                yPercent: rate,
                ease: "none",
                scrollTrigger: {
                  trigger: cell,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          });
        });
      }

      // CTA Reveal
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: EASE.out,
          scrollTrigger: { trigger: ctaRef.current, start: "top 88%", once: true },
        }
      );

      return () => {
        revertParallax?.();
      };
    },
    { scope: sectionRef }
  );

  // Keyboard controls lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? 0 : (i - 1 + images.length) % images.length));
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? 0 : (i + 1) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  const openLightbox = useCallback((i: number) => {
    setLightbox(i);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = "";
  }, []);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative overflow-hidden py-24 md:py-36 bg-[var(--color-background)] border-t border-[var(--color-border)]/50"
    >
      {/* Background overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(var(--color-gold-rgb), 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-8">
        {/* Title Heading */}
        <div ref={headingRef} className="mb-20 flex flex-col items-center text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)]">
            {eyebrow}
          </p>
          <h2
            id="gallery-heading"
            className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] font-black tracking-tight text-[var(--color-foreground)] leading-[1.05]"
          >
            {title}
          </h2>
          <p className="mt-6 max-w-2xl text-base text-[var(--color-muted)] leading-relaxed">
            {descriptionText}
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2 md:gap-6"
        >
          {preview.map((img, i) => {
            let colSpan = "col-span-1";
            let rowSpan = "row-span-1";
            let aspect = "aspect-[4/5]";

            // Asymmetrical grid column/row ratios
            if (i === 0) {
              colSpan = "col-span-2 md:col-span-2";
              rowSpan = "row-span-2";
              aspect = "aspect-[4/3] md:aspect-auto h-full";
            } else if (i === 3) {
              colSpan = "col-span-2 md:col-span-2";
              rowSpan = "row-span-1";
              aspect = "aspect-[21/9]";
            }

            return (
              <div
                key={i}
                data-cell
                className={`group relative overflow-hidden rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]/50 shadow-md cursor-pointer ${colSpan} ${rowSpan}`}
                onClick={() => openLightbox(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(i);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open photo size: ${img.alt}`}
              >
                <div className={`relative w-full overflow-hidden ${aspect}`}>
                  <div data-parallax className="relative w-full h-[120%]">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 group-hover:brightness-[0.9]"
                      sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                    />
                  </div>

                  <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-15 mix-blend-overlay pointer-events-none" />

                  {/* Dark scrim overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

                  {/* Text details */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex items-end justify-between translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-sm font-semibold tracking-wide text-white/95">
                      {img.alt || "Villa detail"}
                    </p>
                  </div>

                  {/* Hover indicator icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-2xl">
                      <Maximize2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA link */}
        <div ref={ctaRef} className="mt-20 flex justify-center">
          <Link
            href="/gallery"
            transitionTypes={["spa-page"]}
            className="group relative inline-flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-10 py-4.5 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] shadow-md transition-all duration-300 hover:border-[var(--color-gold)] hover:shadow-[0_12px_40px_rgba(201,165,90,0.15)] hover:scale-102"
          >
            <span>Explore Full Gallery</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-background)] transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4 text-[var(--color-gold)]" />
            </span>
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox !== null && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image details"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl"
            onClick={closeLightbox}
          >
            <div
              className="relative flex h-full w-full max-w-[90vw] md:max-w-[80vw] flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex h-[78vh] w-full items-center justify-center">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="relative max-h-full max-w-full"
                >
                  <Image
                    src={images[lightbox].src}
                    alt={images[lightbox].alt}
                    width={images[lightbox].w}
                    height={images[lightbox].h}
                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] border border-white/10"
                    quality={90}
                    priority
                  />
                </motion.div>
              </div>

              {/* Lightbox details bar */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-6 py-2.5 backdrop-blur-md">
                <span className="text-xs font-bold text-white tracking-widest">
                  {lightbox + 1} <span className="text-white/30">/</span> {images.length}
                </span>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-xs text-white/80 font-medium tracking-wide">{images[lightbox].alt}</span>
              </div>

              {/* Lightbox controls */}
              <button
                ref={closeRef}
                onClick={closeLightbox}
                aria-label="Close"
                className="absolute right-0 top-0 md:-right-8 md:-top-8 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/15 hover:scale-105"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                onClick={() => setLightbox((i) => (i === null ? 0 : (i - 1 + images.length) % images.length))}
                aria-label="Prev photo"
                className="absolute left-0 top-1/2 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/15 hover:-translate-x-1 md:-left-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={() => setLightbox((i) => (i === null ? 0 : (i + 1) % images.length))}
                aria-label="Next photo"
                className="absolute right-0 top-1/2 flex h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/15 hover:translate-x-1 md:-right-12"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
