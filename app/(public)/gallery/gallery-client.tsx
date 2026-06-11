"use client";

import { useEffect, useMemo, useRef, useState, startTransition, ViewTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SectionReveal } from "@/components/motion/section-reveal";

type Img = { src: string; alt: string; w: number; h: number };

function inferCategory(alt: string, src: string): string {
  const s = `${alt} ${src}`.toLowerCase();
  if (/bedroom|bed|suite|interior|living|bathroom|kitchen|room/.test(s)) {
    return "Interiors";
  }
  if (/pool|garden|lagoon|drone|aerial|exterior|facade|outdoor|deck/.test(s)) {
    return "Grounds";
  }
  if (/beach|ocean|sea|sand|coast|wave/.test(s)) {
    return "Coastal";
  }
  if (/food|dining|chef|meal|breakfast/.test(s)) {
    return "Dining";
  }
  if (/sunset|sunrise|sky|golden/.test(s)) {
    return "Moments";
  }
  return "Gallery";
}

// Custom Premium SVGs for Lightbox controls
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const PrevIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8" aria-hidden="true">
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8" aria-hidden="true">
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export default function GalleryClient({ images }: { images: Img[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const enriched = useMemo(
    () =>
      images.map((im) => ({
        ...im,
        category: inferCategory(im.alt ?? "", im.src),
      })),
    [images],
  );

  const categories = useMemo(() => {
    const unique = [...new Set(enriched.map((i) => i.category))].sort(
      (a, b) => a.localeCompare(b),
    );
    return ["All", ...unique];
  }, [enriched]);

  const filtered =
    activeCategory === "All"
      ? enriched
      : enriched.filter((i) => i.category === activeCategory);

  // Keyboard controls & body scroll lock
  useEffect(() => {
    if (selected == null) return;

    const onKey = (e: KeyboardEvent) => {
      const len = filtered.length;
      if (len === 0) return;
      if (e.key === "Escape") startTransition(() => setSelected(null));
      if (e.key === "ArrowLeft")
        startTransition(() =>
          setSelected((p) =>
            p == null ? null : p > 0 ? p - 1 : len - 1
          )
        );
      if (e.key === "ArrowRight")
        startTransition(() =>
          setSelected((p) =>
            p == null ? null : p < len - 1 ? p + 1 : 0
          )
        );
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected, filtered.length]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDragging(false);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const s = dragStart.current;
    if (!s) return;
    const dx = Math.abs(e.clientX - s.x);
    const dy = Math.abs(e.clientY - s.y);
    if (dx + dy > 8) setDragging(true);
  };
  const onMouseUp = (index: number) => {
    if (!dragging) {
      startTransition(() => setSelected(index));
    }
    dragStart.current = null;
    setDragging(false);
  };

  const galleryImageName = (src: string) => `gallery-${src.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
    <>
      {/* Category segmented pills */}
      <div className="mb-16 flex flex-wrap justify-center gap-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                startTransition(() => setSelected(null));
              }}
              className={[
                "px-5 py-2.5 text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 rounded-sm border cursor-pointer",
                isActive
                  ? "bg-accent border-accent text-background shadow-md"
                  : "border-border/60 bg-card text-foreground/75 hover:border-accent/30 hover:text-accent"
              ].join(" ")}
            >
              <span>{cat}</span>
              <span className="ml-2 opacity-65 font-mono text-[10px]">
                ({cat !== "All" ? enriched.filter((x) => x.category === cat).length : enriched.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Masonry Layout */}
      <div
        className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        {filtered.map((image, i) => (
          <motion.div
            key={image.src + i}
            className="break-inside-avoid group cursor-pointer"
            whileHover={{ scale: 1.012, y: -4 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => onMouseUp(i)}
          >
            <SectionReveal>
              <ViewTransition
                name={galleryImageName(image.src)}
                share="morph"
                default="none"
              >
              <div
                className="relative overflow-hidden rounded-sm bg-card border border-border/60 shadow-sm transition-all duration-500 hover:border-accent/20 hover:shadow-lg"
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt || "Lake View Villa photo"}
                  width={image.w}
                  height={image.h}
                  className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Visual Image Info overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <div className="absolute bottom-4 left-5 right-5 text-foreground z-10 opacity-0 transform translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
                  <p className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-accent mb-1">
                    {image.category}
                  </p>
                  <p className="text-xs text-foreground/80 font-display font-bold tracking-tight">
                    {image.alt}
                  </p>
                </div>
              </div>
              </ViewTransition>
            </SectionReveal>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selected !== null && filtered[selected] != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-6"
            onClick={() => startTransition(() => setSelected(null))}
          >
            <div className="relative max-w-6xl max-h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
              
              {/* Close Button */}
              <button
                onClick={() => startTransition(() => setSelected(null))}
                className="absolute -top-16 right-0 text-foreground/60 hover:text-accent transition-colors z-10 cursor-pointer p-2 rounded-sm border border-border/40 bg-card/40 hover:bg-card"
                aria-label="Close"
              >
                <CloseIcon />
              </button>

              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const len = filtered.length;
                  startTransition(() =>
                    setSelected((p) =>
                      p == null ? null : p > 0 ? p - 1 : len - 1
                    )
                  );
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-accent transition-colors z-10 cursor-pointer p-3 rounded-sm border border-border/40 bg-card/40 hover:bg-card"
                aria-label="Previous photo"
              >
                <PrevIcon />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const len = filtered.length;
                  startTransition(() =>
                    setSelected((p) =>
                      p == null ? null : p < len - 1 ? p + 1 : 0
                    )
                  );
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-accent transition-colors z-10 cursor-pointer p-3 rounded-sm border border-border/40 bg-card/40 hover:bg-card"
                aria-label="Next photo"
              >
                <NextIcon />
              </button>

              {/* Image Frame */}
              <ViewTransition
                name={galleryImageName(filtered[selected].src)}
                share="morph"
              >
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="relative overflow-hidden rounded-sm border border-border/60 shadow-2xl bg-card"
              >
                <Image
                  src={filtered[selected].src}
                  alt={filtered[selected].alt}
                  width={filtered[selected].w}
                  height={filtered[selected].h}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                  priority
                />
              </motion.div>
              </ViewTransition>

              {/* Label details bar */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-foreground text-[10px] font-sans font-bold uppercase tracking-widest flex items-center gap-3 bg-card border border-border/60 px-5 py-3 rounded-sm shadow-md">
                <span>{selected + 1} / {filtered.length}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-foreground/80 font-medium tracking-normal normal-case">{filtered[selected].alt}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

