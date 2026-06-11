"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SectionHeading } from "@/components/ui/section-heading";

const PREVIEW_IMAGES = [
  {
    src: "/villa/optimized/drone_view_villa.webp",
    alt: "Aerial view of Lake View Villa and the tranquil lagoon waters",
    category: "Lagoon",
    aspect: "aspect-video",
  },
  {
    src: "/villa/optimized/villa_outside_03.webp",
    alt: "Luxury colonial exterior facade of Lake View Villa Tangalle",
    category: "Architecture",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/villa/optimized/room_01_img_01.webp",
    alt: "Premium master suite interior with high wooden ceilings and A/C",
    category: "Suites",
    aspect: "aspect-square",
  },
  {
    src: "/villa/optimized/garden_img_01.webp",
    alt: "Lush tropical green gardens on the private estate grounds",
    category: "Gardens",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/villa/optimized/lake_img_01.webp",
    alt: "Serene morning overlooking Tangalle lake with mist",
    category: "Scenic",
    aspect: "aspect-video",
  },
  {
    src: "/villa/optimized/kitchen_img_01.webp",
    alt: "Modern kitchen and elegant dining space for local feasts",
    category: "Dining",
    aspect: "aspect-square",
  },
];

type GalleryImage = (typeof PREVIEW_IMAGES)[number];

export function GalleryTeaser({
  cmsData,
}: {
  cmsData?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items?: GalleryImage[];
  };
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const eyebrow = cmsData?.eyebrow || "A Visual Journey";
  const title = cmsData?.title || "Wander through our sanctuary.";
  const description =
    cmsData?.description ||
    "A glimpse into the daily rhythm of life beside the lagoon. Captured in still frames of light and shadow.";
  const images =
    Array.isArray(cmsData?.items) && cmsData.items.length > 0
      ? cmsData.items
      : PREVIEW_IMAGES;

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const items = gridRef.current?.querySelectorAll<HTMLElement>("[data-gallery-item]");
      if (!items?.length) return;

      // Premium clip-path reveal combined with subtle spring translations
      gsap.fromTo(
        items,
        { opacity: 0, y: 50, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.08,
          ease: "cubic-bezier(0.16, 1, 0.3, 1)",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
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
      id="gallery-teaser"
      aria-labelledby="gallery-teaser-heading"
      className="relative overflow-hidden bg-background py-24 md:py-32 border-t border-border/40"
    >
      {/* Background radial highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem]"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, var(--color-primary) 0%, transparent 70%)",
          opacity: 0.03
        }}
      />

      {/* Title */}
      <div className="lv-container relative pb-20">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />
      </div>

      {/* Masonry Grid Container */}
      <div className="lv-container relative">
        <div
          ref={gridRef}
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]"
          role="list"
        >
          {images.map((img, i) => (
            <div
              key={i}
              data-gallery-item
              className="break-inside-avoid group relative p-[1px] rounded-sm bg-gradient-to-b from-foreground/10 to-transparent dark:from-white/5 dark:to-transparent overflow-hidden cursor-pointer hover:shadow-[0_20px_50px_rgba(11,32,39,0.1)] transition-all duration-500"
            >
              {/* Inner Double-Bezel Frame - sharp luxury geometry */}
              <div
                className={[
                  "relative w-full rounded-[3px] overflow-hidden bg-card border border-foreground/5 dark:border-white/5",
                  img.aspect,
                ].join(" ")}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                  quality={90}
                />

                {/* Elegant overlay screen with category pill & caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-2 block">
                    {img.category}
                  </span>
                  <p className="text-sm font-display font-bold text-foreground leading-snug tracking-tight">
                    {img.alt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Gallery CTA Link with Premium Double Bezel */}
        <div className="mt-20 flex justify-center">
          <Link
            href="/gallery"
            className="group relative inline-flex items-center gap-6 border border-accent/30 bg-accent/5 px-8 py-4 text-xs font-bold uppercase tracking-widest text-accent transition-all duration-500 hover:bg-accent hover:text-background hover:scale-[1.02] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              View Full Gallery
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            
            {/* Outline highlight border animation */}
            <span className="absolute inset-0 border border-transparent group-hover:border-accent scale-105 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}

